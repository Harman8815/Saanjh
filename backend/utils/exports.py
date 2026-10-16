"""
File export helpers for CSV and XLSX downloads.

Both helpers share one tabular contract: ``headers`` is a list of column
labels (or ``(key, label)`` pairs when rows are dicts) and ``rows`` is an
iterable of either sequences (positional) or dicts (keyed by the header key).

Each helper returns a ready-to-return Django ``HttpResponse`` carrying the
correct content type and ``Content-Disposition``, so a view can simply
``return write_csv(...)``. The frontend ``apiClient`` envelope unwrapping does
not apply here: a file download must not be JSON.
"""

import csv
from io import BytesIO, StringIO

from django.http import HttpResponse


def _normalise_headers(headers):
    """
    Accept ``['Name', ...]`` or ``[('first_name', 'Name'), ...]``.

    Returns ``(keys, labels)``. A plain string is both its own key and label.
    """
    keys, labels = [], []
    for header in headers:
        if isinstance(header, (tuple, list)):
            key, label = header[0], header[1]
        else:
            key, label = header, header
        keys.append(key)
        labels.append(str(label))
    return keys, labels


def _cell(value):
    """Render None as an empty cell; leave everything else to the writer."""
    return '' if value is None else value


def _row_values(row, keys):
    if isinstance(row, dict):
        return [_cell(row.get(key)) for key in keys]
    if isinstance(row, (list, tuple)):
        return [_cell(value) for value in row]
    # A scalar row (single column) is still a valid one-cell row.
    return [_cell(row)]


def write_csv(rows, headers, filename='export.csv'):
    """Build a CSV download from ``rows``/``headers``."""
    keys, labels = _normalise_headers(headers)

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(labels)
    for row in rows:
        writer.writerow(_row_values(row, keys))

    response = HttpResponse(buffer.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def write_xlsx(rows, headers, filename='export.xlsx', sheet_name='Export'):
    """Build an XLSX download from ``rows``/``headers``."""
    # Imported lazily: openpyxl pulls in a sizeable XML stack, and CSV-only
    # deployments should not pay for it at import time.
    from openpyxl import Workbook

    keys, labels = _normalise_headers(headers)

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = sheet_name
    sheet.append(labels)
    for row in rows:
        sheet.append(_row_values(row, keys))

    buffer = BytesIO()
    workbook.save(buffer)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
