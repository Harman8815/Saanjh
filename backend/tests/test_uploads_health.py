"""
Test cases for upload validation, media URL scheme checks, and health checks.
"""

from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from utils.uploads import (
    validate_uploaded_file,
    validate_media_url,
    upload_limits,
    max_upload_size_bytes,
)
from .test_utils import APITestCase


class UploadValidationTestCase(APITestCase):
    """File uploads are validated on type and size before reaching storage."""

    def _upload(self, name, content=b'data', content_type='application/octet-stream'):
        return SimpleUploadedFile(name, content, content_type=content_type)

    def test_allowed_document_extension_passes(self):
        """A permitted document type is accepted."""
        upload = self._upload('contract.pdf', b'%PDF-1.4', 'application/pdf')
        self.assertEqual(validate_uploaded_file(upload, group='documents'), upload)

    def test_disallowed_extension_is_rejected(self):
        """An executable or HTML file is rejected."""
        upload = self._upload('evil.exe', b'MZ', 'application/octet-stream')
        with self.assertRaises(Exception):
            validate_uploaded_file(upload, group='documents')

    def test_html_upload_is_rejected(self):
        """A .html file is rejected even with an allowed-looking name."""
        upload = self._upload('x.html', b'<html>', 'text/html')
        with self.assertRaises(Exception):
            validate_uploaded_file(upload, group='documents')

    def test_allowed_extension_with_disguised_mime_is_rejected(self):
        """A .pdf whose content type is executable is rejected."""
        upload = self._upload('malware.pdf', b'MZ', 'application/x-msdownload')
        with self.assertRaises(Exception):
            validate_uploaded_file(upload, group='documents')

    def test_oversized_document_is_rejected(self):
        """A file past the size ceiling is rejected."""
        limit = max_upload_size_bytes('documents')
        upload = self._upload('big.pdf', b'a' * (limit + 1), 'application/pdf')
        with self.assertRaises(Exception):
            validate_uploaded_file(upload, group='documents')

    def test_image_extension_passes(self):
        """An image is accepted in the images group."""
        upload = self._upload('photo.jpg', b'jpegdata', 'image/jpeg')
        self.assertEqual(validate_uploaded_file(upload, group='images'), upload)

    def test_document_rejected_in_image_group(self):
        """A PDF is not an acceptable image."""
        upload = self._upload('contract.pdf', b'%PDF', 'application/pdf')
        with self.assertRaises(Exception):
            validate_uploaded_file(upload, group='images')

    def test_missing_upload_passes_through(self):
        """A missing file is left to the required-field check on the serializer."""
        self.assertIsNone(validate_uploaded_file(None, group='documents'))

    def test_limits_are_exposed(self):
        """The configured limits are introspectable for docs/tests."""
        limits = upload_limits()
        self.assertIn('documents', limits)
        self.assertIn('images', limits)
        self.assertGreater(limits['documents']['max_bytes'], 0)


class MediaUrlValidationTestCase(APITestCase):
    """Media stores external URLs, so the scheme must be constrained."""

    def test_http_url_is_accepted(self):
        self.assertEqual(validate_media_url('http://example.com/a.jpg'), 'http://example.com/a.jpg')

    def test_https_url_is_accepted(self):
        self.assertEqual(validate_media_url('https://example.com/a.jpg'), 'https://example.com/a.jpg')

    def test_javascript_scheme_is_rejected(self):
        """A javascript: URL would execute when rendered."""
        with self.assertRaises(Exception):
            validate_media_url('javascript:alert(1)')

    def test_data_scheme_is_rejected(self):
        with self.assertRaises(Exception):
            validate_media_url('data:text/html;base64,PHNjcmlwdD4=')

    def test_empty_url_is_allowed(self):
        """A cleared URL is permitted, since the field is optional."""
        self.assertEqual(validate_media_url(''), '')


class DocumentUploadEndpointTestCase(APITestCase):
    """The document create endpoint enforces the upload rules via the API."""

    def setUp(self):
        # The base test case already creates self.wedding for self.user, and
        # Wedding.user is a OneToOne, so a second row would violate it.
        super().setUp()
        self.authenticate()

    def _post(self, name, content=b'data', content_type='application/octet-stream'):
        return self.client.post(
            '/api/documents/',
            {
                'name': name,
                'file': SimpleUploadedFile(name, content, content_type=content_type),
            },
            format='multipart',
        )

    def test_valid_document_is_created(self):
        """A permitted document uploads successfully."""
        response = self._post('contract.pdf', b'%PDF-1.4', 'application/pdf')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_executable_is_rejected(self):
        """An .exe upload is a validation error."""
        response = self._post('evil.exe', b'MZ', 'application/octet-stream')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_html_is_rejected(self):
        """An .html upload is a validation error."""
        response = self._post('page.html', b'<html>', 'text/html')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_oversized_file_is_rejected(self):
        """A file over the limit is a validation error, not a 500."""
        from utils.uploads import max_upload_size_bytes
        response = self._post(
            'big.pdf', b'a' * (max_upload_size_bytes('documents') + 1), 'application/pdf'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class HealthCheckTestCase(APITestCase):
    """The health endpoint must not require authentication."""

    def test_health_endpoint_is_public(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_reports_database(self):
        response = self.client.get('/health/')
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['status'], 'ok')
        self.assertIn('database', data['data'])

    def test_health_head_request(self):
        """Load balancers may probe with HEAD."""
        response = self.client.head('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
