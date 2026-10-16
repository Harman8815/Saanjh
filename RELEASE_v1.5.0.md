# Release v1.5.0 - Task Recurrence, Templates & Enhanced Timeline

**Release Date:** 2026-10-15
**Tag:** `v1.5.0`
**Branch:** `feature/task-recurrence-timeline-calendar` → `master`

---

## 🎉 Highlights

This release introduces **task recurrence & templates**, **TaskBoard Kanban view**, and **enhanced timeline calendar views** (Day/Week/Month) with a unified event form modal.

---

## ✨ New Features

### Tasks Module
- **Task Templates** (`TaskTemplate` model): Create reusable task templates with recurrence rules (daily, weekly, monthly, yearly, custom)
- **Task Occurrences** (`TaskOccurrence` model): Automatic generation of recurring task instances with timezone-aware scheduling
- **TaskBoard Kanban View** (`TaskBoard.tsx`): Drag-and-drop Kanban board for visual task management with columns (To Do, In Progress, Review, Done)
- **Parent/Sub-task Support**: Hierarchical task organization with `parent_task` relationship
- **Enhanced Task Modal**: Updated with recurrence configuration and template selection

### Timeline Module
- **Day View** (`DayView.tsx`): Hourly timeline with event blocks, drag-to-create, and inline editing
- **Week View** (`WeekView.tsx`): 7-day grid with multi-day event spanning and conflict detection
- **Month View** (`MonthView.tsx`): Calendar grid with event density indicators and quick-create
- **CalendarView** (`CalendarView.tsx`): Unified calendar component switching between Day/Week/Month
- **EventFormModal** (`EventFormModal.tsx`): Single modal for creating/editing timeline events with recurrence, reminders, and color coding
- **End Time Support**: Added `end_time` field to `TimelineEvent` model for precise scheduling

### Backend Enhancements
- New Django migrations for `TaskTemplate`, `TaskOccurrence`, and `TimelineEvent.end_time`
- Comprehensive test suite for Stage 5 task features (`test_tasks_stage5.py`)
- Updated serializers, views, and admin interfaces for tasks and timeline
- RBAC permissions extended for new models

### Frontend Enhancements
- New hooks: `useTasks.ts`, `useTimeline.ts` with React Query integration
- Updated `types/api.ts` with new TypeScript interfaces
- Enhanced task and timeline services with full CRUD + recurrence operations
- Tailwind CSS dark wedding theme maintained across new components

---

## 📦 Database Migrations

### Backend
| App | Migration | Description |
|-----|-----------|-------------|
| tasks | 0005 | Add TaskTemplate, parent_task, recurrence fields |
| tasks | 0006 | Add TaskOccurrence model |
| timeline | 0008 | Add end_time to TimelineEvent |

Run migrations:
```bash
cd backend
python manage.py migrate
```

---

## 🔧 Breaking Changes

None. This is a backward-compatible feature release.

---

## 📝 Full Changelog

### Added
- `backend/tasks/models.py`: TaskTemplate, TaskOccurrence models with recurrence rules
- `backend/tasks/migrations/0005_*.py`, `0006_*.py`: Database migrations
- `backend/tasks/serializers.py`: Serializers for new models
- `backend/tasks/views.py`: ViewSets for templates and occurrences
- `backend/tasks/admin.py`: Admin registration for new models
- `backend/timeline/models.py`: Added `end_time` to TimelineEvent
- `backend/timeline/migrations/0008_*.py`: Migration for end_time
- `backend/tests/test_tasks_stage5.py`: Comprehensive test coverage
- `frontend/components/dashboard/tasks/TaskBoard.tsx`: Kanban board component
- `frontend/components/dashboard/timeline/CalendarView.tsx`: Unified calendar
- `frontend/components/dashboard/timeline/DayView.tsx`: Day view
- `frontend/components/dashboard/timeline/WeekView.tsx`: Week view
- `frontend/components/dashboard/timeline/MonthView.tsx`: Month view
- `frontend/components/dashboard/timeline/EventFormModal.tsx`: Event form modal
- `frontend/hooks/useTasks.ts`: Task management hook
- `frontend/hooks/useTimeline.ts`: Timeline management hook
- `frontend/services/tasks.ts`: Task API service
- `frontend/services/timeline.ts`: Timeline API service
- `frontend/types/api.ts`: Updated TypeScript types

### Changed
- `backend/tasks/models.py`: Added parent_task FK, recurrence fields to Task
- `backend/timeline/models.py`: Added end_time field
- `backend/tasks/serializers.py`: Extended for templates/occurrences
- `backend/timeline/serializers.py`: Added end_time field
- `frontend/app/dashboard/tasks/page.tsx`: Integrated TaskBoard
- `frontend/app/dashboard/timeline/page.tsx`: Integrated CalendarView
- `frontend/components/dashboard/tasks/TaskList.tsx`: Enhanced with template actions
- `frontend/components/dashboard/tasks/TaskModal.tsx`: Added recurrence config

### Removed
- `backend/media/documents/2026/10/contract_4y3WaR8.pdf`: Generated PDF removed from tracking

---

## 🚀 Deployment

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend
cd frontend
npm install
npm run build
```

---

## 🏷️ Version Bump

- **Previous:** v1.4.0-staging
- **Current:** v1.5.0 (minor version bump for new features)

Frontend version: `1.3.0-prod` → `1.4.0-prod` (in package.json)
Backend version: `1.6.0` → `1.7.0` (in package.json)

---

## 👥 Contributors

- Harman (lead)

---

## 📄 License

MIT