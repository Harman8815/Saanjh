"""
Validation helpers for user-supplied file uploads.

Uploads are validated on both extension and content type, with a size ceiling,
so a malicious or accidental file is rejected before it reaches storage.
"""

from django.conf import settings
from rest_framework import serializers

# Extensions that are permitted, grouped by purpose. Anything not listed here
# is rejected, so an HTML or EXE upload cannot be smuggled through.
ALLOWED_EXTENSIONS = {
    'documents': [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.txt', '.csv', '.rtf', '.odt', '.ods', '.odp',
    ],
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
    # Guest-list spreadsheets (import flows).
    'guestlist': ['.csv', '.xlsx'],
}

# MIME types allowed per group. A request must pass both checks.
ALLOWED_MIME_TYPES = {
    'documents': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv', 'application/rtf',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.presentation',
    ],
    'images': [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    ],
    'guestlist': [
        'text/csv', 'application/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        # Some browsers/clients send this for .xlsx; harmless overlap.
        'application/vnd.ms-excel',
    ],
}

# Size ceilings. Documents are contracts/floorplans; photos come from guests;
# guest list spreadsheets are capped at 5000 rows server-side.
MAX_UPLOAD_SIZES = {
    'documents': 25 * 1024 * 1024,   # 25 MB
    'images': 10 * 1024 * 1024,      # 10 MB
    'guestlist': 5 * 1024 * 1024,    # 5 MB
}


def _extension_of(name):
    """Lowercase extension including the leading dot, or ''."""
    import os

    _, ext = os.path.splitext(name or '')
    return ext.lower()


def validate_uploaded_file(upload, group='documents'):
    """
    Validate an uploaded file for type and size.

    Raises DRF ValidationError with a field-level message so the caller sees
    which rule was broken. `group` selects the allowed set.
    """
    if not upload:
        return upload

    name = getattr(upload, 'name', '') or ''
    extension = _extension_of(name)
    allowed_extensions = ALLOWED_EXTENSIONS.get(group, [])
    if extension not in allowed_extensions:
        raise serializers.ValidationError(
            f'Unsupported file type "{extension or "unknown"}". '
            f'Allowed: {", ".join(sorted(allowed_extensions))}.'
        )

    content_type = (getattr(upload, 'content_type', '') or '').lower()
    if content_type:
        allowed_mimes = ALLOWED_MIME_TYPES.get(group, [])
        if allowed_mimes and content_type not in allowed_mimes:
            raise serializers.ValidationError(
                f'Content type "{content_type}" is not permitted for this upload.'
            )

    max_size = MAX_UPLOAD_SIZES.get(group)
    if max_size is not None and getattr(upload, 'size', 0) > max_size:
        limit_mb = max_size // (1024 * 1024)
        raise serializers.ValidationError(
            f'File is too large. The limit is {limit_mb} MB.'
        )

    return upload


def upload_limits():
    """Expose the configured limits for API documentation / tests."""
    return {
        group: {
            'extensions': sorted(ALLOWED_EXTENSIONS[group]),
            'max_bytes': MAX_UPLOAD_SIZES[group],
        }
        for group in ALLOWED_EXTENSIONS
    }


def max_upload_size_bytes(group='documents'):
    """Size ceiling for a group, overridable via settings."""
    return getattr(settings, f'MAX_{group.upper()}_UPLOAD_BYTES', None) or MAX_UPLOAD_SIZES[group]


def validate_media_url(value, field_name='file_url'):
    """
    Accept only absolute http(s) URLs.

    Media stores external URLs rather than uploads, so a javascript: or data:
    URL here would render as script in the browser.
    """
    if not value:
        return value

    from urllib.parse import urlparse

    scheme = urlparse(str(value)).scheme.lower()
    if scheme not in ('http', 'https'):
        raise serializers.ValidationError(
            f'{field_name} must be an http or https URL.'
        )
    return value
