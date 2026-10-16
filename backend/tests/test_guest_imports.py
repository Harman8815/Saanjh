"""
Stage 2: guest import tests (preview -> commit, row validation, caps).

Covers the contract the plan requires: unknown rsvp_status/relationship
values are reported not coerced, rows are caped at 5000, the file is checked
by utils.uploads before parsing, duplicates are flagged, and committing
twice cannot double-import (the token is single-use).
"""

import io

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from guests.imports import (
    MAX_IMPORT_ROWS,
    GUEST_IMPORT_HEADERS,
    normalise_header,
)
from guests.models import Guest, GuestGroup, RsvpStatus
from weddings.models import Wedding, WeddingStatus

User = get_user_model()


def build_csv(rows):
    """Build a CSV upload with the canonical header row."""
    buffer = io.StringIO()
    header = ','.join(header for _key, header in GUEST_IMPORT_HEADERS)
    buffer.write(header + '\n')
    for row in rows:
        buffer.write(','.join(row) + '\n')
    return io.BytesIO(buffer.getvalue().encode('utf-8'))


def build_xlsx(rows):
    from openpyxl import Workbook

    workbook = Workbook()
    sheet = workbook.active
    sheet.append([header for _key, header in GUEST_IMPORT_HEADERS])
    for row in rows:
        sheet.append(row)
    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    return buffer


class GuestImportTestCase(TestCase):
    """Endpoint + helper behaviour for the two-phase import."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=timezone.now().date(),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        # --nomigrations skips seed migrations, so the reference rows the
        # import validates against are created here.
        for name in ('pending', 'confirmed', 'declined'):
            RsvpStatus.objects.get_or_create(name=name)

    def upload_csv(self, rows, filename='guests.csv'):
        upload = build_csv(rows)
        upload.name = filename
        upload.content_type = 'text/csv'
        return upload

    def upload_xlsx(self, rows, filename='guests.xlsx'):
        upload = build_xlsx(rows)
        upload.name = filename
        upload.content_type = (
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        return upload

    # --- parsing ----------------------------------------------------------

    def test_headers_normalise(self):
        self.assertEqual(normalise_header('RSVP Status'), 'rsvp_status')
        self.assertEqual(normalise_header(' first  name '), 'first_name')

    def test_preview_reports_valid_rows(self):
        upload = self.upload_csv([
            ['Ada', 'Lovelace', 'ada@example.com', '5551234567', 'friend', 'confirmed'],
            ['Grace', 'Hopper', 'grace@example.com', '5559998888', 'colleague', 'pending'],
        ])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['summary']['total_rows'], 2)
        self.assertEqual(data['summary']['valid_rows'], 2)
        self.assertEqual(data['summary']['invalid_rows'], 0)
        self.assertTrue(data['token'])
        # Emails and statuses are parsed into typed fields.
        row = data['rows'][0]
        self.assertEqual(row['data']['email'], 'ada@example.com')
        self.assertEqual(row['data']['rsvp_status_id'], RsvpStatus.objects.get(name='confirmed').id)

    def test_preview_reports_bad_status_and_relationship_without_coercing(self):
        upload = self.upload_csv([
            ['Bad', 'Status', '', '', 'friend', 'going'],
            ['Bad', 'Relationship', '', '', 'roommate', 'pending'],
        ])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        data = response.json()['data']
        self.assertEqual(data['summary']['invalid_rows'], 2)
        first = data['rows'][0]
        self.assertIn('Unknown RSVP status "going"', first['errors'][0])
        self.assertIsNone(first['data'])
        second = data['rows'][1]
        self.assertIn('Unknown relationship "roommate"', second['errors'][0])

    def test_preview_reports_row_numbers(self):
        upload = self.upload_csv([
            ['OK', 'Row', '', '', 'friend', 'pending'],
            ['', '', '', '', 'friend', 'pending'],
        ])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        rows = response.json()['data']['rows']
        self.assertEqual(rows[0]['row'], 2)
        self.assertEqual(rows[1]['row'], 3)
        self.assertFalse(rows[1]['valid'])

    def test_preview_flags_duplicates_against_existing_guests(self):
        Guest.objects.create(
            wedding=self.wedding, first_name='Ada', last_name='Lovelace',
            email='ada@example.com',
        )
        upload = self.upload_csv([['Ada', 'Lovelace', 'ada@example.com', '', 'friend', 'pending']])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        row = response.json()['data']['rows'][0]
        self.assertTrue(row['is_duplicate'])
        self.assertEqual(response.json()['data']['summary']['duplicate_rows'], 1)

    def test_invalid_email_is_reported(self):
        upload = self.upload_csv([['No', 'At', 'not-an-email', '', 'friend', 'pending']])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        row = response.json()['data']['rows'][0]
        self.assertFalse(row['valid'])
        self.assertIn('not a valid email', row['errors'][0])

    def test_row_cap_enforced(self):
        rows = [['A', 'B', '', '', 'friend', 'pending'] for _ in range(MAX_IMPORT_ROWS + 1)]
        upload = self.upload_csv(rows)

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('import limit', str(response.json()['error']['details']))

    def test_rejects_unsupported_extension(self):
        upload = io.BytesIO(b'not a spreadsheet')
        upload.name = 'guests.txt'
        upload.content_type = 'text/plain'

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('Unsupported file type', str(response.json()['error']['details']))

    def test_missing_file_returns_400(self):
        response = self.client.post('/api/guests/import/preview/', {}, format='multipart')

        self.assertEqual(response.status_code, 400)

    def test_xlsx_preview_parses(self):
        upload = self.upload_xlsx([
            ['Ada', 'Lovelace', 'ada@example.com', '5551234567', 'friend', 'confirmed'],
        ])

        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )

        data = response.json()['data']
        self.assertEqual(data['summary']['valid_rows'], 1)
        self.assertEqual(data['rows'][0]['data']['first_name'], 'Ada')

    # --- commit -----------------------------------------------------------

    def _preview(self, upload):
        response = self.client.post(
            '/api/guests/import/preview/', {'file': upload}, format='multipart'
        )
        return response.json()['data']

    def test_commit_creates_guests_and_consumes_token(self):
        upload = self.upload_csv([
            ['Ada', 'Lovelace', 'ada@example.com', '5551234567', 'friend', 'confirmed'],
            ['Grace', 'Hopper', 'grace@example.com', '5559998888', 'colleague', 'pending'],
        ])
        preview = self._preview(upload)

        response = self.client.post(
            '/api/guests/import/', {'token': preview['token']}, format='json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['created'], 2)
        self.assertEqual(data['skipped'], 0)
        self.assertEqual(Guest.objects.filter(wedding=self.wedding).count(), 2)
        guest = Guest.objects.get(email='ada@example.com')
        self.assertEqual(guest.first_name, 'Ada')
        self.assertEqual(guest.rsvp_status.name, 'confirmed')

        # The token is single-use: committing again finds nothing.
        again = self.client.post(
            '/api/guests/import/', {'token': preview['token']}, format='json'
        )
        self.assertEqual(again.status_code, 404)
        self.assertEqual(Guest.objects.filter(wedding=self.wedding).count(), 2)

    def test_commit_skips_duplicate_and_invalid_rows(self):
        Guest.objects.create(
            wedding=self.wedding, first_name='Ada', last_name='Lovelace',
            email='ada@example.com',
        )
        upload = self.upload_csv([
            ['Ada', 'Lovelace', 'ada@example.com', '', 'friend', 'pending'],  # duplicate
            ['Bad', 'Row', '', '', 'roommate', 'pending'],                     # invalid
            ['New', 'Person', 'new@example.com', '', 'friend', 'pending'],    # fine
        ])
        preview = self._preview(upload)

        response = self.client.post(
            '/api/guests/import/', {'token': preview['token']}, format='json'
        )

        data = response.json()['data']
        self.assertEqual(data['created'], 1)
        self.assertEqual(data['skipped'], 2)
        self.assertEqual(Guest.objects.filter(wedding=self.wedding).count(), 2)

    def test_commit_without_token_is_rejected(self):
        response = self.client.post('/api/guests/import/', {}, format='json')

        self.assertEqual(response.status_code, 400)

    def test_commit_with_unknown_token_is_404(self):
        response = self.client.post(
            '/api/guests/import/', {'token': 'nope'}, format='json'
        )

        self.assertEqual(response.status_code, 404)

    def test_group_names_are_resolved(self):
        GuestGroup.objects.create(wedding=self.wedding, name='College Friends')
        upload = self.upload_csv([
            ['Ada', 'Lovelace', '', '', 'friend', 'pending', '', '', '', 'College friends'],
        ])
        preview = self._preview(upload)

        response = self.client.post(
            '/api/guests/import/', {'token': preview['token']}, format='json'
        )
        self.assertEqual(response.json()['data']['created'], 1)
        self.assertEqual(Guest.objects.get().group.name, 'College Friends')

    def test_unknown_group_is_reported(self):
        upload = self.upload_csv([
            ['Ada', 'Lovelace', '', '', 'friend', 'pending', '', '', '', 'Ghost group'],
        ])

        preview = self._preview(upload)

        self.assertFalse(preview['rows'][0]['valid'])
        self.assertIn('Unknown group', preview['rows'][0]['errors'][0])

    # --- template ----------------------------------------------------------

    def test_import_template_csv(self):
        response = self.client.get('/api/guests/import-template/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertEqual(
            'attachment; filename="guest-import-template.csv"',
            response['Content-Disposition'],
        )
        header_line = response.content.decode('utf-8').splitlines()[0]
        self.assertIn('First Name', header_line)
        self.assertIn('RSVP Status', header_line)

    def test_import_template_xlsx(self):
        response = self.client.get('/api/guests/import-template/?type=xlsx')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            response['Content-Type'],
        )
        self.assertTrue(response.content.startswith(b'PK'))

    def test_import_template_rejects_reserved_format_param(self):
        """?format= is DRF's reserved negotiation param, so it 404s here."""
        response = self.client.get('/api/guests/import-template/?format=xlsx')
        self.assertEqual(response.status_code, 404)
