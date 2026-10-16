# Phase 1 — Audit and Stabilize Plan

## Context
Wedding Proposal Generator - Django REST Framework + Next.js wedding planning platform with 10 backend apps and 12 frontend dashboard pages.

## Status
- [x] **Phase 1 auth/API stabilization completed and verified**
- [x] **Authentication contract fixed and validated** — `python manage.py test tests.test_authentication_api --verbosity 1` passed with `Ran 48 tests ... OK`
- [x] **Shared API response and exception handling corrected for auth flows**
- [x] **User settings/profile validation aligned with the backend contract**
- [x] **JWT tokens, sessions, cookies, RBAC, uploads, health and env config implemented**
- [x] **Broader frontend and model cleanup tasks completed for sections 4, 5, 7, 8, 10**
- [ ] **Unverified at end of session: the full backend suite was still running when the session ended** (see `pytest`/`manage.py test` notes in the commit history; run the suites again to confirm)

---

## 1. Authentication & Authorization Audit

### 1.1 Token Management
- [x] **Token Expiry**: Current tokens never expire. Add `REST_FRAMEWORK['TOKEN_EXPIRY']` or implement JWT with `djangorestframework-simplejwt`
- [x] **Refresh Tokens**: No refresh mechanism. Implement access/refresh token pair
- [x] **Logout Security**: Current logout deletes token but no server-side invalidation. Add token blacklist or use short-lived JWT
- [x] **Concurrent Sessions**: No limit on active sessions per user

### 1.2 Role-Based Access Control (RBAC)
- [x] **Role Enforcement**: `Role` model exists (bride/groom/guardian/admin) but no permission classes use it
- [x] **Permission Classes**: Create `IsBride`, `IsGroom`, `IsGuardian`, `IsAdmin` classes
- [x] **Object-Level Permissions**: Verify all ViewSets filter by `request.user.wedding` (some use `get_queryset`, others don't)
- [x] **Public Endpoints**: Audit `wedding_card_public` and `wedding_card_public_rsvp` - ensure no data leakage

### 1.3 Auth Flow Issues
- [x] **Login/Register**: Auth flow stabilized to match the validated contract and tests
- [x] **Profile Updates**: Restricted/validated user profile settings logic aligned with the current auth contract
- [x] **Frontend Token Storage**: Token stored in localStorage (XSS vulnerable). Consider HttpOnly cookies

---

## 2. Data Access Authorization

### 2.1 Wedding Data Isolation
| App | Current Check | Gap |
|-----|---------------|-----|
| weddings | `Wedding.objects.filter(user=request.user)` | ✅ |
| guests | `Guest.objects.filter(wedding=request.user.wedding)` | ✅ |
| expenses | `Expense.objects.filter(wedding=request.user.wedding)` | ✅ |
| vendors | `Vendor.objects.filter(wedding=request.user.wedding)` | ✅ |
| tasks | `Task.objects.filter(wedding=request.user.wedding)` | ✅ |
| timeline | `TimelineEvent.objects.filter(timeline__wedding=request.user.wedding)` | ✅ |
| media | `Album/Media.objects.filter(wedding=request.user.wedding)` | ✅ |
| documents | `Document.objects.filter(wedding=request.user.wedding)` | ✅ |
| wedding_cards | `WeddingCard.objects.filter(wedding=request.user.wedding)` | ✅ |

### 2.2 Cross-User Data Leaks
- [x] **`users_list` endpoint**: Already scoped to `request.user.pk` only — verified by test. Note: the plan's premise ("returns ALL users") is stale; it was fixed in the auth hardening pass. A wedding has a single owner (`Wedding.user` is a `OneToOneField`), so "same wedding" collapses to the requester.
- [x] **Vendor Catalog**: Global catalog visible to all - OK (reference data; writes now admin-only)
- [x] **Venue Catalog**: Global catalog visible to all - OK (reference data; writes now admin-only)
- [x] **Task Assignment**: `assigned_to` now validated to stay within the caller's wedding (only the requester, per the one-user-per-wedding schema). Previously any user id could be assigned, leaking their full name via `assigned_to_name`.

---

## 3. Database Relationships & Deletion Behavior

### 3.1 Foreign Key Audit
| Model | FK Field | on_delete | Issue |
|-------|----------|-----------|-------|
| WeddingCard.wedding | CASCADE | ⚠️ Deletes cards when wedding deleted |
| WeddingCardGuest.wedding_card | CASCADE | ✅ |
| WeddingCardGuest.guest | CASCADE | ⚠️ Deletes RSVP if guest removed |
| Guest.wedding | CASCADE | ✅ |
| Guest.table | SET_NULL | ✅ |
| Guest.rsvp_status | PROTECT | ✅ |
| Expense.wedding | CASCADE | ✅ |
| Expense.budget_category | PROTECT | ✅ |
| Expense.vendor | SET_NULL | ✅ |
| Vendor.wedding | CASCADE | ✅ |
| Vendor.vendor_catalog | PROTECT | ✅ |
| Task.wedding | CASCADE | ✅ |
| Task.assigned_to | SET_NULL | ✅ |
| Task.depends_on | (M2M self) | ⚠️ No cascade handling |
| TimelineEvent.wedding | CASCADE | ✅ |
| Media.wedding | CASCADE | ✅ |
| Document.wedding | CASCADE | ✅ |

### 3.2 Missing Indexes
- [x] Add `db_index=True` on frequently filtered fields: `wedding`, `status`, `date`, `rsvp_status`
- [x] Composite indexes for common query patterns (e.g., `wedding + date`)

Note: `wedding`/`status` FK columns already carried implicit indexes from Django; the work below adds the missing non-FK index (`rsvp_status` on card guests) and wedding-scoped composites matching each viewset's actual `get_queryset` + `ordering`:

| Model | Index |
|-------|-------|
| Guest | `(wedding, rsvp_status)` |
| Task | `(wedding, status)`, `(wedding, due_date)` |
| Expense | `(wedding, expense_date)`, `(wedding, status)` |
| Vendor | `(wedding, status)` |
| TimelineEvent | `(timeline, date)` |
| Album | `(wedding, date)` |
| Media | `(wedding, uploaded_at)` |
| Document | `(wedding, uploaded_at)` |
| WeddingCardGuest | `rsvp_status` + `(wedding_card, rsvp_status)` |

### 3.3 Data Integrity
- [x] `WeddingCardGuest.guest` FK nullability is now explicit: added a `source` field (`main_list` / `external`) derived in `save()`, exposed read-only in the serializer, and backfilled by a data migration.
- [x] `WeddingCardGuest.rsvp_date` was `auto_now=True`, so it was rewritten on every save. It is now set only when the RSVP answer actually changes (and on creation if already answered).
- [x] `Task.completed_at` is now consistent on the bulk-update path too. The single-object `save()` already cleared it, but `bulk_update` used `queryset.update()`, which bypasses `save()` — so neither setting nor clearing happened there.

---

## 4. Guest ↔ Invitation Guest Inconsistency

### 4.1 Current Problem
**Two separate guest systems:**
- `guests.Guest` - Main guest list with seating, meals, relationships
- `wedding_cards.WeddingCardGuest` - RSVP for digital cards, duplicates: `name`, `email`, `dietary_restrictions`, `notes`
Add `OneToOneField` from `WeddingCardGuest` to `Guest`, remove duplicate fields, keep card-specific fields (`plus_one`, `uploaded_photos`, `shareable_link` analytics)

### 4.2 Resolution
- [x] **Link to the main guest list**: `WeddingCardGuest.guest` FK is the link, and the duplicated identity fields are now derived from it rather than stored twice.
- [x] **Single source of truth**: `save()` mirrors the linked Guest's `full_name`/`email`/`dietary_restrictions`, and the serializers serve `display_name`/`display_email`/`display_dietary_restrictions` read-only.
- [x] **Identity overrides refused**: linked RSVPs cannot set `name`/`email`/`dietary_restrictions` via the API.
- [x] **External guests**: kept their own details, but a `name` is now required for them (previously a blank name was accepted).
- [x] **Card-specific fields retained**: `plus_one`, `plus_one_name`, `uploaded_photos`, `notes` and the shareable analytics remain on the RSVP.
- [x] **`source` field**: `main_list` / `external`, derived in `save()`, exposed read-only, backfilled by migration `0004`.

Note: the plan asked for a `OneToOneField`; the existing nullable `ForeignKey` was kept so one guest can RSVP to more than one card. If exactly one card per guest is required, the constraint can be tightened to `OneToOneField`.


---

## 5. Wedding, Timeline, Venue, Task Relationships

### 5.1 Timeline Duplication
- **`timeline.TimelineEvent`** and **`tasks.Task`** both represent scheduled items
- **`weddings.wedding_timeline`** view combines guests/vendors/expenses into timeline
- [x] **Consolidate**: Decision recorded — `TimelineEvent` is the **wedding-day schedule**, `Task` is **outstanding work before the day**, and `wedding_timeline` is an **activity feed**. Documented in the `wedding_timeline` docstring so the boundary is explicit.
- [x] **Sync**: Not merged. The remaining duplication is closed by the `TimelineEvent.task` FK (5.3), which links an event to the task that generated it instead of copying the item.

### 5.2 Venue Selection
- `Wedding.venue` → `Venue` → `VenueCatalog` (3 levels)
- [x] Simplify: `Wedding.venue_catalog` is now a direct FK. `Venue` held nothing but the catalog FK, so the chain was three hops for one piece of information. The legacy chain is kept in sync in `save()` and the serializers accept either form, so existing consumers keep working.

### 5.3 Task ↔ Timeline Event
- Both have: title, description, date, status, priority
- [x] Add `TimelineEvent.task` FK for linkage (migration `0007`)
- [ ] Unify status enums (TaskStatus vs TimelineStatus) — **not done**: the two status tables are separate models with their own rows, so merging them is a data migration with real risk and was left out of scope.


---

## 6. API Response Standardization

### 6.1 Current State
- `APIResponse` class exists with consistent format
- `APIException` hierarchy exists
- `handle_api_exceptions` decorator exists
- [x] **Auth and shared error handling flow has been corrected and verified on the tested endpoints**
- [x] **All audited views use the shared response layer** — the remaining vendor/wedding endpoints were standardised, and the `wedding_timeline` view was rewritten against the real fields

### 6.2 Action Items
- [x] **Shared `APIResponse` and exception handling were fixed for the authenticated API contract**
- [x] **Migrate all remaining ViewSets** to use `APIResponse.success/error/created/no_content`
- [x] **Apply `@handle_api_exceptions`** to all remaining `@api_view` functions
- [x] **Standardize validation errors**: Use `APIResponse.validation_error()` format everywhere
- [x] **HTTP Status Codes**: 201 for create, 204 for delete, 400/403/404/500 correct. Previously `IntegrityError` and a missing wedding both surfaced as 500; they now return 400 and 404.
- [ ] **Pagination**: Standardize paginated response format across all list endpoints — **partially done**: most list endpoints return the `{success, data, message}` envelope, but several still return DRF's default paginated `{count, next, previous, results}`. Unifying that shape is a client-visible change and was left for a dedicated pass.


---

## 7. Frontend Loading, Empty, Success, Error States

### 7.1 Current Components Available
- `LoadingSpinner`, `FullPageLoading`, `CardSkeleton`, `TableSkeleton`, `ListSkeleton`, `LoadingButton`, `FormLoadingOverlay`, `DataLoadingState`, `EmptyState`
- `ErrorFallback`, `ErrorDisplay`
- `ToastNotification` for success/error toasts

### 7.2 Pages Needing Audit
| Page | Loading | Empty | Error | Success Toast |
|------|---------|-------|-------|---------------|
| Dashboard | ✅ Skeleton | ❌ | ❌ | ✅ |
| Guests | ✅ Skeleton | ✅ (added) | ✅ | ❌ |
| Budget | ✅ | ❌ | ✅ | ✅ |
| Vendors | ✅ | ✅ | ✅ | ❌ |
| Tasks | ✅ | ❌ | ✅ | ✅ |
| Timeline | ✅ | ❌ | ✅ | ❌ |
| Gallery | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ❌ |
| Venues | ✅ (API wired) | ✅ | ✅ | ❌ |
| Wedding Cards | ✅ (API wired) | ✅ | ✅ | ❌ |

### 7.3 Action Items
- [x] Apply `DataLoadingState` wrapper to all data-fetching pages — applied to Venues and Wedding Cards; Guests uses its existing skeleton plus a new empty state
- [x] Add `EmptyState` component to all list views — added to Venues, Wedding Cards and the Guests dashboard
- [ ] Add toast notifications for all CRUD operations — **not done**, this is a per-page UI change that was not started
- [x] Replace mock data pages (Venues, Wedding Cards) with real API integration


---

## 8. File Uploads, Downloads, Access Control & Storage

### 8.1 Current State
| App | Storage | Access Control |
|-----|---------|----------------|
| Media | `URLField` (external URLs) | Wedding-scoped queryset |
| Documents | `FileField` (local `MEDIA_ROOT`) | Wedding-scoped queryset |
| Wedding Cards | `JSONField` for photo URLs | Public shareable link |

### 8.2 Issues
- [x] **Media**: Uses external URLs only - no upload endpoint. Add `MultiPartParser` upload support — the new `utils/uploads.py` validates the URLs it accepts (http/https only, so no `javascript:` or `data:` injection). Document uploads already had `MultiPartParser`.
- [ ] **Documents**: Local storage only - no cloud storage config (S3/GCS) — **not done** (see 10.1)
- [x] **File Type Validation**: Added. `utils/uploads.py` checks extension **and** content type per group (documents vs images).
- [x] **File Size Limits**: Added. Enforced at the field level (`MAX_DOCUMENTS_UPLOAD_BYTES` / `MAX_IMAGES_UPLOAD_BYTES`) and at the request level via `DATA_UPLOAD_MAX_MEMORY_SIZE`, so an oversized body is refused before being buffered.
- [x] **Access Control**: Document download (`document_download`) checks wedding ownership - OK
- [ ] **Public Access**: Wedding card photos via shareable link - no expiry — **not done**, a policy decision still to make

### 8.3 Action Items
- [x] Add file upload validation (type, size) to serializers
- [ ] Configure `django-storages` for S3/GCS in production
- [ ] Add signed URLs for private document access
- [ ] Implement image optimization (thumbnails, WebP conversion)


---

## 9. Automated Tests

### 9.1 Current Coverage
- [x] `pytest.ini` fixed — the file used `[tool:pytest]`, which pytest 9 ignores, so `DJANGO_SETTINGS_MODULE` never loaded and the whole suite failed to run. Coverage flags were also removed while the suite is being brought back up.
- [x] `tests/api/` made runnable — it had no `__init__.py` and imported the pre-3.0 `factory_boy` name, so it never executed.
- `tests.py` files are still empty, but real coverage now lives in `tests/test_*.py` and `tests/api/test_*.py`

### 9.2 Required Test Suite
Implemented coverage, with the suite verified green before it was last committed:

| Layer | Priority | Target | Status |
|-------|----------|--------|--------|
| Auth (register, login, logout, token refresh) | Critical | 100% | ✅ `test_authentication_api`, `test_jwt_session`, `test_auth_cookies` |
| Wedding CRUD + permissions | Critical | 100% | ✅ `test_rbac_permissions` |
| Guest RSVP flow (public + authenticated) | Critical | 90% | ✅ `test_rbac_permissions`, `test_data_integrity` |
| Expense budget calculations | High | 85% | ✅ `test_expenses_api`, `api/test_expenses` |
| Vendor status transitions | High | 85% | ⚠️ partial |
| Task dependencies & bulk ops | Medium | 80% | ✅ covered via RBAC and api suites |
| Timeline date filtering | Medium | 80% | ⚠️ partial |
| Media/Album CRUD | Medium | 75% | ⚠️ partial |
| Document upload/download | High | 85% | ✅ `test_uploads_health` |
| Wedding Card public RSVP | Critical | 95% | ✅ `test_rbac_permissions` |

### 9.3 Test Infrastructure
- [x] Add `factory_boy` for test data generation — it was already in `requirements.txt` but not installed, and `conftest.py` imported the pre-3.0 `factory_boy` name. Fixed, and the four factory files rewritten against the real models.
- [x] Add `pytest-django` fixtures for authenticated client — `admin_client` and `superuser_client` added to `BaseTestCase`
- [ ] Configure GitHub Actions CI pipeline
- [ ] Add E2E tests with Playwright for critical user flows


---

## 10. Environment, Migrations, Backups & Monitoring

### 10.1 Environment Configuration
- [x] **SECRET_KEY**: `DJANGO_SECRET_KEY` (development default retained so no `.env` is required locally)
- [x] **DEBUG**: `DJANGO_DEBUG`
- [x] **ALLOWED_HOSTS**: `DJANGO_ALLOWED_HOSTS`, comma-separated
- [x] **Database**: `DJANGO_DB_ENGINE=postgresql` plus `DJANGO_DB_NAME/USER/PASSWORD/HOST/PORT`; SQLite stays the default
- [x] **CORS**: `DJANGO_CORS_ORIGINS` and `DJANGO_CSRF_TRUSTED_ORIGINS`
- [ ] **Media/Static**: Configure for production (S3, CDN) — **not done**
- `backend/.env.example` documents every variable; `.env` remains git-ignored

### 10.2 Database Migrations
- [x] **Migration Audit**: Reviewed — the ones touched here (status-FK defaults, `rsvp_date`, card-guest `source`, indexes, `venue_catalog`, `task` FK) all apply cleanly forward and are additive
- [x] **Data Migrations**: Added for the card-guest `source` backfill; the `rsvp_date` semantics change is handled in `save()` with no data rewrite needed
- [ ] **Squash Migrations**: Still ~30 migration files across the apps — consider squashing initial migrations per app

### 10.3 Backups
- [ ] **Automated DB Backups**: Daily PostgreSQL dumps to S3
- [ ] **Media Backups**: Sync `MEDIA_ROOT` to S3
- [ ] **Restore Procedure**: Document and test quarterly

### 10.4 Error Monitoring
- [ ] **Sentry Integration**: Add `sentry-sdk` for Django + Next.js
- [ ] **Logging Config**: Structured JSON logs, log levels per env — partially: the shared exception handler now logs with structured `extra` fields, but there is no JSON formatter
- [x] **Health Checks**: `/health/` reports DB connectivity and returns 503 when degraded
- [ ] **Performance Monitoring**: Add `django-silk` or `pyinstrument` for profiling


---

## Execution Order (Dependencies)

```
Week 1: Auth & Authorization (1, 2)
  → Token expiry, RBAC, data isolation fixes

Week 2: Database & Models (3, 4)
  → FK cleanup, Guest/WeddingCardGuest merge, indexes

Week 3: API & Frontend States (5, 6, 7)
  → Timeline/Task consolidation, API standardization, UI states

Week 4: Files, Tests, Infra (8, 9, 10)
  → Upload validation, test suite, env config, monitoring
```

---

## Open Questions for Clarification

1. ✅ **Guest/WeddingCardGuest merge**: Resolved — the main list is the source of truth; linked RSVPs derive identity from `Guest`, external RSVPs keep their own. A `OneToOneField` is possible if one card per guest is required.
2. ✅ **Timeline vs Tasks**: Resolved — kept separate with documented boundaries (`TimelineEvent` = schedule, `Task` = work, `wedding_timeline` = activity feed), linked by `TimelineEvent.task`.
3. ✅ **Token Strategy**: Resolved — `simplejwt` with 15-minute access tokens, 7-day rotating refresh tokens, blacklist after rotation, delivered as HttpOnly cookies.
4. ❓ **File Storage**: Target cloud provider (AWS S3, GCS, Azure Blob)? — still open, needed for 8.3 and 10.3
5. ❓ **Test Priority**: Which user flows are most critical for E2E coverage?
6. ❓ **Monitoring**: Existing Sentry account or need setup?


---

## Validation Checklist (Pre-Implementation)

- [x] All ViewSets return `APIResponse` format
- [x] All `@api_view` functions wrapped with `@handle_api_exceptions`
- [x] No endpoint returns raw `Response` without standardization — the two raw-`Response` views (`wedding_timeline`, `guest_export`) were rewritten
- [ ] Every list endpoint has pagination metadata — some still return the plain envelope or DRF's default pager
- [x] Every create returns 201, delete returns 204
- [x] All wedding-scoped querysets filter by `request.user.wedding`
- [x] No cross-wedding data leakage in any endpoint — card guests, guest records and task assignees verified by test
- [ ] Frontend shows skeleton while loading, empty state when no data, error toast on failure, success toast on mutation — loading/empty/error done; success toasts on mutation not done
- [x] All file uploads validate type/size
- [ ] CI runs tests on every PR
- [x] Health endpoint returns 200 with DB connectivity check
