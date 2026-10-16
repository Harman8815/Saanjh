# Phase 3 — Improve Existing Modules

## Goal

Extend the six existing dashboard modules (Dashboard, Guests, Budget, Vendors, Tasks/Timeline, Gallery/Documents) with the features in the Phase 3 brief, without breaking the current API contract.

Stack (verified): Django 5.2 + DRF backend (`backend/`), Next.js 16.2 / React 19 / Zustand / SWR + TanStack Query / Tailwind 4 / Framer Motion / recharts frontend (`frontend/`). SQLite by default, Postgres via env. `APIResponse` envelope, JWT cookies, `get_request_wedding(request)`, `IsAdminOrReadOnly`.

---

## Verified current state (gaps that Phase 3 closes)

| Area | Current state | Gap |
|---|---|---|
| Dashboard | `wedding_dashboard()` at `backend/weddings/views.py:255` | `budget_used` hardcoded `0` (line 302); `recent_activities.vendors[].date` is always `None` (line 334); `total_actual` duplicates `total_estimated`; no alerts, no readiness score, no links; Quick Action buttons have no handlers (`frontend/app/dashboard/page.tsx:456-475`) |
| Guests | `Guest` (`backend/guests/models.py:74`), `Table` + `assign_guest` with capacity check (views.py:134) | No CSV/XLSX import, no duplicate detection, no household/family grouping, no plus-one, dietary is free text, `reminder_sent` is a bare boolean, seating has no bulk/auto assign |
| Budget | `Expense` (`backend/expenses/models.py:52`), `BudgetCategory` (line 16) | `spent_amount()`/`remaining_amount()` are Python loops (N+1); no committed/paid/outstanding split, no projection, no overspend alerts, no payment schedule, `receipt_url` only, no export |
| Vendors | `Vendor` (`backend/vendors/models.py:55`) with `cost_estimate`/`actual_cost`/`status` | **No `created_at`/`updated_at`** (reason dashboard date is `None`); no quotes, contracts, deposits, milestones, follow-ups, or communication history; no comparison view |
| Tasks | `Task` (`backend/tasks/models.py:57`) with `depends_on`, `progress`, tags | No subtasks, comments, recurrence, or templates; UI is list-only (`TaskList.tsx`) — no Kanban; no cycle prevention; no calendar export |
| Timeline | `TimelineEvent` (`backend/timeline/models.py:40`), `task` FK | No conflict detection; no iCalendar export |
| Gallery | `Media.file_url` is a `URLField` (`backend/media/models.py:124`) — uploads are not real files; `AlbumTag` is per-album (line 93) | No bulk upload, no image optimization, no shared tags, no guest submission workflow |
| Documents | `Document` (`backend/documents/models.py:30`) | No version history, no expiry, no access/download audit; `document_download` (views.py:393) has no throttling |

Already available and reusable: `openpyxl`, `Pillow`, `celery`/`kombu`, `redis`/`django-redis`, `django-anymail` in `backend/requirements.txt`; `recharts`, `date-fns`, `react-hook-form`, `zod` in `frontend/package.json`.

---

## Architecture decisions

1. **Reminders**: new `notifications` app with a generic `Reminder` row, delivered by a Celery task (`notifications.tasks.send_due_reminders`) scheduled through `celery beat`. Redis is the broker and result backend (`redis` and `django-redis` are already in `backend/requirements.txt`, and `django-anymail` is available for production email). The same logic also exists as `manage.py send_due_reminders` so it stays testable and manually runnable — the Celery task is a thin wrapper around it. Email uses `django.core.mail` via the existing `EMAIL_*` settings (console backend in dev).
2. **Imports/exports**: `openpyxl` for `.xlsx`, stdlib `csv` for `.csv`. Imports are two-phase: `POST .../import/preview/` returns per-row validation results, then `POST .../import/` commits with an explicit `confirm=true`.
3. **Drag and drop**: add `@hello-pangea/dnd` (React 19 compatible, maintained fork of `react-beautiful-dnd`). No DnD library is currently installed.
4. **Alerts** are computed server-side in one place (`utils/wedding_insights.py`) so the dashboard, module pages, and the notification digest all read the same rules.
5. **Metric names are fixed** and used identically everywhere:
   - `total_budget` = Σ `BudgetCategory.allocated_amount`
   - `committed` = Σ `Expense.amount` for non-cancelled expenses
   - `paid` = Σ `Expense.paid_amount`
   - `outstanding` = `committed - paid`
   - `budget_used_pct` = `committed / total_budget`
   - `projected_final_cost` = `committed` + Σ `Vendor.cost_estimate` for vendors with no `actual_cost`
6. **Readiness score** = weighted mean of five domain completion percentages: venue chosen (0.15), budget configured (0.15), guest RSVP progress (0.20), vendor confirmation (0.20), task completion (0.30).
7. All new models carry `wedding` FKs and are queried through `get_request_wedding(request)` or `request.user.wedding`, matching existing permission behaviour.

---

## Stage 0 — Shared foundations (blocks everything else)

- [x] `backend/notifications/` app: `Reminder` model (`wedding` FK, `kind`, `target_type`/`target_id` via `ContentType`, `channel` = `email`/`in_app`, `scheduled_for`, `status` = `pending`/`sent`/`failed`/`cancelled`, `sent_at`, `error`), `serializers.py`, `views.py` (list/cancel + `POST /api/notifications/test-send/`), `urls.py`, `admin.py`; register in `INSTALLED_APPS` (`backend/wedding_backend/settings.py:61`) and `urlpatterns` (`backend/wedding_backend/urls.py:38`).
- [x] `backend/notifications/tasks.py` + `backend/wedding_backend/celery.py`: Celery app with `autodiscover_tasks`, `CELERY_BROKER_URL` (default `redis://localhost:6379/0`) and `CELERY_RESULT_BACKEND` read via the existing `_env`/`_env_list` helpers in `settings.py:19`, `beat_schedule` entry calling `send_due_reminders` every 15 minutes, `task_acks_late` + `task_reject_on_worker_lost` so a reminder is never dropped, and `import wedding_backend.celery` in `backend/wedding_backend/__init__.py`. Add `DJANGO_CELERY_BROKER_URL` to any `.env.example`.
- [x] `backend/notifications/management/commands/send_due_reminders.py` — claims due rows with a `status` transition (favouring an atomic `UPDATE ... WHERE status='pending'` so concurrent workers cannot double-send; use `select_for_update` only on Postgres), sends, records `sent_at`/`error`, and never raises on a single-row failure. `--dry-run` flag prints what would be sent.
- [x] Document the run commands: `celery -A wedding_backend worker -l info`, `celery -A wedding_backend beat -l info`, `python manage.py send_due_reminders`.
- [x] `backend/utils/exports.py` — `write_csv(rows, headers)` and `write_xlsx(rows, headers)` helpers returning a Django `HttpResponse` with the correct content type and `Content-Disposition`.
- [x] `backend/utils/wedding_insights.py` — `get_metrics(wedding)`, `get_alerts(wedding)`, `get_readiness(wedding)`, `get_recent_activity(wedding)`. Pure functions, no HTTP. This is the single source of truth for the metric definitions above.
- [x] Frontend `frontend/components/ui/AlertBanner.tsx`, `ProgressRing.tsx`, `EmptyState.tsx` (extend `components/ui/loading-states.tsx` / `error-components.tsx`, which currently use light-theme classes).
- [x] Frontend `frontend/hooks/useAlerts.ts` (SWR on the dashboard payload) and `frontend/hooks/useImports.ts`.

---

## Stage 1 — Dashboard

- [x] Add `created_at`/`updated_at` (`auto_now_add`/`auto_now`) to `Vendor` with a data migration defaulting existing rows; update `Vendor` ordering/indexes.
- [x] Rewrite `wedding_dashboard()` (`backend/weddings/views.py:255`) to call `utils/wedding_insights.py` and return `metrics`, `readiness`, `alerts`, `recent_activity` (real vendor dates).
- [x] Extend `WeddingDashboard` in `frontend/types/api.ts:119` with `metrics`, `readiness`, `alerts[]`; each alert carries `{ id, severity, title, message, action_label, action_url, entity_type, entity_id }`.
- [x] Alert rules: overdue expenses (`Expense.is_overdue()` already exists), unpaid expenses due ≤14 days, pending RSVPs with invitation sent >7 days ago, vendors stuck in `contacted` >14 days, tasks overdue (`Task.is_overdue()`), budget categories >90% allocated, venue capacity < confirmed guests.
- [x] `frontend/app/dashboard/page.tsx`: render `<AlertBanner>`; make the four metric cards link to filtered module routes (e.g. `/dashboard/guests/list?rsvp_status=pending`, `/dashboard/budget?tab=history&status=pending`, `/dashboard/tasks?is_overdue=true`); add a readiness section with `ProgressRing` per domain; wire the five Quick Action buttons to real handlers (open the existing `AddGuestModal` / `ExpenseModal`, navigate to vendors, navigate to timeline create).
- [x] Replace `timeline.filter(...)` "Tasks Complete" maths with the canonical `metrics.tasks_completion_pct`.

---

## Stage 2 — Guest management

### Backend
- [x] `GuestGroup` model (`wedding` FK, `name`, `side`, `group_type` = `family`/`friend`/`colleague`/`household`, `notes`) + `Guest.group` FK (`SET_NULL`); serializer fields `group`, `group_id`.
- [x] Plus-one on `Guest`: `plus_one_name`, `plus_one_rsvp_status` (reuse `RsvpStatus`, nullable), `is_plus_one_of` self-FK.
- [x] Structured dietary: `DietaryOption` model (global) + `GuestDietary` junction; keep `dietary_restrictions` text as a free-form fallback. Add `meal_ids`-style `dietary_ids` write field to serializers.
- [x] `GET /api/guests/duplicates/` — score by normalised email (1.0), phone (0.9), `first_name`+`last_name` (0.8), `last_name`+`address` (0.6); threshold 0.8; return clusters with a `merge` suggestion. Normalisation: lowercase, strip punctuation, `phone` last 10 digits.
- [x] `POST /api/guests/import/preview/` and `POST /api/guests/import/` — `MultiPartParser`, accept `.csv`/`.xlsx` (validate extension + MIME through `utils/uploads.py:validate_uploaded_file`, adding a `guestlist` group), cap 5000 rows. Per-row errors returned with row numbers; unknown `rsvp_status`/`relationship` values are reported, not silently coerced. Duplicate preview must be flagged per row.
- [x] `GET /api/guests/import-template/` — downloadable CSV/XLSX with headers.
- [x] `POST /api/guests/bulk_update/` — allowlist: `rsvp_status_id`, `table_id`, `relationship`, `group_id`, `invitation_sent`, `dietary_ids`, `notes`; iterate (not `.update()`) so model signals/`save()` run.
- [x] Reminders: `POST /api/guests/reminders/schedule/` (`guest_ids[]`, `scheduled_for`, `channel`) creating `notifications.Reminder` rows; on send, set the existing `Guest.reminder_sent`/`reminder_sent_date` fields.
- [x] Seating: `POST /api/guests/tables/{id}/bulk-assign/` and `POST /api/guests/seating/auto-assign/` (largest-group-first greedy fill). Every assignment path must keep the existing capacity guard from `TableViewSet.assign_guest` (`backend/guests/views.py:154`) — validate `table.assigned_guests.count() < table.capacity` **and** the wedding-wide venue capacity.

### Frontend
- [ ] `frontend/app/dashboard/guests/list/page.tsx` (currently 1339 lines): extract `GuestTable`, `GuestFilters`, `BulkActionBar`, `GuestImportModal`, `DuplicateMergeModal` into `frontend/components/dashboard/guests/`.
- [ ] Import wizard: file pick → preview table with row errors → confirm → summary. Add `frontend/services/guests.ts` methods and `frontend/hooks/useGuests.ts` mutations (SWR key invalidation already established).
- [ ] Groups UI: group filter + group column + inline group assignment; plus-one and dietary fields in `AddGuestModal.tsx`.
- [ ] Seating page (`app/dashboard/guests/seating/page.tsx`): capacity bar per table, drag guest chips between tables, unassigned tray, validation toast on overflow.

---

## Stage 3 — Budget and expenses

### Backend
- [x] Replace `BudgetCategory.spent_amount()`/`remaining_amount()` Python loops (`backend/expenses/models.py:30-38`) with `Sum` annotations on the queryset; keep the methods but implement them with a single aggregate.
- [x] Add `BudgetCategory.alert_threshold_pct` (default 90) and `Expense.committed_amount` derivation is unnecessary — `amount` is already the commitment.
- [x] `PaymentSchedule` model: `expense` FK, `due_date`, `amount`, `status` (reuse `ExpenseStatus` or a local choice), `paid_date`. `Expense` gains `is_paid_off` property = `paid_amount >= amount`.
- [x] Overspend alerts: category where `committed > allocated` (critical) or `committed/allocated >= threshold` (warning) — emitted from `utils/wedding_insights.py`.
- [x] Projected final cost + variance per category in `expense_statistics()` (`backend/expenses/views.py:271`): `projected`, `variance`, `variance_pct`.
- [x] Receipts: `ExpenseReceipt` M2M-style junction to `documents.Document` (reuses upload + later versioning); keep `receipt_url` for external links.
- [x] `GET /api/expenses/export/?format=csv|xlsx&…` using `utils/exports.py`, honouring the same filters as the list endpoint.

### Frontend
- [ ] `components/dashboard/budget/BudgetTab.tsx`: add a budget-vs-actual chart per category using `recharts` (available) — allocated vs committed vs paid.
- [ ] New `ProjectionTab`: projected final cost, variance per category, 30/60/90-day payment schedule timeline.
- [ ] `SummaryCards.tsx`: show committed / paid / outstanding as three separate stat cards (currently collapses to spent/paid).
- [ ] `ExpenseModal.tsx`: receipt upload (multipart → `documents`), payment schedule rows, due date + reminder scheduling.
- [ ] Add "Export CSV/Excel" button to `HistoryTab.tsx` toolbar.

---

## Stage 4 — Vendors

### Backend
- [ ] `VendorQuote`: `vendor` FK, `title`, `amount`, `valid_until`, `status` (`draft`/`sent`/`accepted`/`rejected`/`expired`), `notes`, `document` FK to `documents.Document`.
- [ ] `VendorContract`: `vendor` FK (OneToOne), `signed_date`, `terms`, `expiry_date`, `document` FK, `deposit_amount`, `deposit_paid`.
- [ ] `VendorMilestone`: `vendor` FK, `name`, `amount`, `due_date`, `paid`, `paid_date`.
- [ ] `VendorCommunication`: `vendor` FK, `type` (`email`/`call`/`meeting`/`note`), `direction`, `subject`, `body`, `occurred_at`, `follow_up_date`, `created_by`.
- [ ] `GET /api/vendors/compare/?ids=1,2,3` — side-by-side cost, quote status, contract/deposit state, milestones paid, rating, expense total from `expenses.Expense`.
- [ ] Follow-ups: `Vendor.follow_up_date` + `POST /api/vendors/{id}/follow-ups/` creating `notifications.Reminder`; `GET /api/vendors/follow-ups/` already exists (`backend/vendors/views.py:235`) — extend it to include due/overdue follow-ups.
- [ ] Estimated vs final: expose `cost_variance` on `VendorSerializer` (`actual_cost - cost_estimate`).

### Frontend
- [ ] `app/dashboard/vendors/[id]/` — add tabs: Quotes, Contract & Payments, Communication (log + history), Compare.
- [ ] Comparison view: pick up to 3 vendors → table with the fields above.
- [ ] `CategoryTabs`/`VendorCard` unchanged; add cost + status badges.

---

## Stage 5 — Tasks and timeline

### Backend
- [ ] `TaskComment` (`task` FK, `author`, `body`, `created_at`), `TaskSubtask` or `Task.parent` self-FK — prefer `Task.parent` self-FK so subtasks inherit filters, plus `progress` rolls up from children.
- [ ] Recurrence on `Task`: `recurrence` (`none`/`daily`/`weekly`/`monthly`), `recurrence_interval`, `recurrence_ends_on`. `POST /api/tasks/{id}/recurrence/skip/` and `complete-occurrence/` so history is not rewritten.
- [ ] `TaskTemplate` + `TaskTemplateItem` (title, description, `offset_days`, `priority`, `category`); `POST /api/tasks/from-template/` instantiates items relative to `wedding.wedding_date` or an explicit anchor date.
- [ ] Cycle prevention in `TaskUpdateSerializer`/`_resolve_bulk_updates`: reject a `depends_on` set that creates a cycle or self-reference; add `GET /api/tasks/{id}/dependencies/` returning the chain and earliest feasible start.
- [ ] `GET /api/tasks/export/ical/` — hand-rolled `VCALENDAR` (no new dependency), tasks + timeline events optional.
- [ ] Add a `board` mode to `TaskViewSet.list` and extend the `by_status` action (`backend/tasks/views.py:326`) with `GET /api/tasks/board/?category=<id>`: a **separate board per `TaskCategory`** returning that category's status columns (each column = `TaskStatus`, with `order`/`color` from the model) plus the category list so the client can switch boards. Columns are defined per category, so the response includes `columns[].task_status` and the tasks grouped under each, in one call.

### Frontend
- [ ] `frontend/app/dashboard/tasks/page.tsx`: add a List/Board toggle. Board is **per category**: a category selector (tab or dropdown) chooses the board, then `@hello-pangea/dnd` renders that category's `TaskStatus` columns with optimistic status change via the existing `useUpdateTask` mutation and rollback on failure (`frontend/hooks/useTasks.ts`). Dragging across categories is a separate explicit action (`PATCH` with `category`), not a drop, because columns belong to one board.
- [ ] `TaskModal.tsx`: subtask list, comment thread, recurrence fields, template picker, dependency multi-select with cycle warnings.
- [ ] `frontend/app/dashboard/timeline/page.tsx` + `components/dashboard/timeline/*`: conflict badges when two events share a date and overlapping times; `GET /api/timeline/conflicts/`; iCal export button; per-event reminders.

---

## Stage 6 — Gallery and documents

### Backend
- [ ] Media uploads: add `Media.file` (`FileField`, null/blank) + `thumbnail` + `width`/`height`; keep `file_url` for external links. On save, generate a thumbnail and cap the longest edge at 2048px with `Pillow`, quality 82 — do this in the serializer/view, not in `Media.save()`, to keep uploads responsive. Validate through `utils/uploads.py` (extend `images` group).
- [ ] `POST /api/media/bulk-upload/` — accepts multiple files, returns per-file results, tolerates partial failure.
- [ ] Share `AlbumTag` across albums: move tags to a wedding-scoped `AlbumTag` with `unique_together ['wedding','name']` and a data migration copying current per-album tags.
- [ ] Guest submissions: `Media.is_guest_submission` + `submitted_by` (name/email string or FK to `wedding_cards.WeddingCardGuest`), `submission_status` (`pending`/`approved`/`rejected`); approval endpoint + gallery filter.
- [ ] Documents: `DocumentVersion` (`document` FK, `file`, `version_number`, `note`, `uploaded_by`, `uploaded_at`) — uploading a new file creates a version and keeps the old file; `GET /api/documents/{id}/versions/`, `POST /api/documents/{id}/versions/{v}/restore/`.
- [ ] Documents: `expiry_date` on `Document` + expiry alerts (30/14/7 days) and reminder scheduling.
- [ ] Documents: tighten `document_download` (`backend/documents/views.py:393`) — stream with `FileResponse`, add `DocumentAccess` audit row (`document`, `user`, `at`, `action`), and require the wedding ownership check that the ViewSet already enforces.

### Frontend
- [ ] `components/gallery/MediaManagementModal.tsx`: real multi-file upload with per-file progress, drag-drop, client-side size/type validation matching the backend limits, thumbnail preview.
- [ ] Album detail (`app/dashboard/gallery/[id]/page.tsx`): tag autocomplete from shared tags, guest-submission moderation queue.
- [ ] Documents page: version history panel, expiry column + filter, download with audit, bulk delete already exists.

---

## Data model summary (new tables)

```
notifications.Reminder        wedding, kind, target(ct), channel, scheduled_for, status, sent_at
guests.GuestGroup             wedding, name, side, group_type
guests.DietaryOption          name (global) + guests.GuestDietary(guest, option)
guests.Guest.group            -> GuestGroup
guests.Guest.plus_one_*       plus_one_name, plus_one_rsvp_status, is_plus_one_of
expenses.PaymentSchedule      expense, due_date, amount, status, paid_date
expenses.ExpenseReceipt       expense -> documents.Document
expenses.BudgetCategory.alert_threshold_pct
vendors.VendorQuote/VendorContract/VendorMilestone/VendorCommunication
vendors.Vendor.created_at, updated_at
tasks.TaskComment             task, author, body
tasks.Task.parent             self FK (subtasks)
tasks.Task.recurrence*        recurrence, recurrence_interval, recurrence_ends_on
tasks.TaskTemplate/TaskTemplateItem
media.Media.file, thumbnail, width, height, is_guest_submission, submitted_by, submission_status
media.AlbumTag                -> wedding (shared)
documents.DocumentVersion     document, file, version_number, note, uploaded_by
documents.Document.expiry_date
documents.DocumentAccess      document, user, at, action
```

---

## Migration and rollout

1. Land **Stage 0** first and merge — every later stage depends on `utils/wedding_insights.py`, `utils/exports.py`, and `notifications`.
2. Each stage ships as: models → migration → serializers → views/urls → frontend types → services → hooks → UI.
3. All model changes are additive and nullable/defaulted, so existing rows and API consumers keep working. The only breaking-adjacent change is the dashboard payload, which gains new keys and fixes the two wrong values (`budget_used`, vendor activity date) — frontend and backend must land together.
4. Register every new model in `backend/<app>/admin.py` and, where relevant, the Jazzmin nav in `settings.py:258`.
5. Run `python manage.py makemigrations --check --dry-run` in CI so migrations are never missing.
6. Keep the `documents`, `media`, `tasks`, `guests` test suites (`backend/<app>/tests.py`) green before starting the next stage.

## Validation

Backend (from `backend/`, `pytest.ini` already sets `DJANGO_SETTINGS_MODULE` and `--reuse-db --nomigrations`):

```
python manage.py makemigrations --check --dry-run
pytest
pytest --no-migrations   # runs real migrations for model/constraint tests
python manage.py send_due_reminders --dry-run
celery -A wedding_backend inspect ping   # worker must be running for reminder tests
```

Add `pytest-celery`-free coverage: use `CELERY_TASK_ALWAYS_EAGER = True` under a test settings override (or set `task_always_eager=True` in a fixture) so reminder tests run without a broker, and keep one integration test against real Redis behind the existing `integration` marker (`backend/pytest.ini`).

Frontend (from `frontend/`; note `package.json` has **no** `typecheck` script — add one or run `npx tsc --noEmit` directly):

```
npm run lint
npx tsc --noEmit
npm run build
```

Required tests to add: dashboard metrics/readiness/alerts unit tests; guest import (valid CSV, invalid CSV, xlsx, duplicates, oversized, bad MIME); duplicate detection scoring; budget overspend + projection; vendor compare; task cycle rejection + template instantiation; document versioning + expiry; media bulk upload partial failure; reminder command idempotency.

## Risks

- `recharts` v3 and React 19 — verify chart rendering before building the budget visualisations.
- `@hello-pangea/dnd` is a new dependency; pin the version and check React 19 + Next 16 compat.
- Redis is now a hard dependency for reminders: document `DJANGO_CELERY_BROKER_URL` and require the worker + beat processes in `README.md` and any deploy config. `send_due_reminders` still works standalone if Redis is down for tests.
- SQLite + `select_for_update`/`UPDATE ... WHERE status='pending'` in `send_due_reminders` is not transactional — rely on the status transition rather than row locks, and note Postgres as the production target (`settings.py:125`).
- N+1 queries: guest list, budget categories, and dashboard stats all currently iterate relations. Add `select_related`/`prefetch_related`/annotations as part of Stages 1-3, not afterwards.
- Media currently stores URLs only; adding `FileField` needs a `MEDIA_ROOT` that is writable and served (`settings.py:186` already configures this for `DEBUG`).

## Resolved decisions

- Reminder delivery: **Celery + Redis**, configured in Stage 0 with a beat schedule; `send_due_reminders` management command retained as a testable wrapper.
- Kanban scope: **one board per `TaskCategory`**, with `TaskStatus` columns inside each board.

## Open questions

1. **Guest import scope**: single-file only (recommended) or multi-file with per-file progress.
