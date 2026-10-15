from datetime import date, datetime, time, timedelta, timezone as datetime_timezone

from tasks.models import (
    Task, TaskCategory, TaskComment, TaskOccurrence, TaskPriority, TaskStatus,
    TaskTemplate, TaskTemplateItem,
)
from timeline.models import Timeline, TimelineEvent
from .test_utils import APITestCase


class TaskStage5ApiTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate()
        self.todo = TaskStatus.objects.get_or_create(name='todo')[0]
        self.completed = TaskStatus.objects.get_or_create(name='completed')[0]
        self.priority = TaskPriority.objects.get_or_create(name='medium')[0]
        self.category = TaskCategory.objects.get_or_create(name='planning')[0]

    def make_task(self, **overrides):
        values = {
            'wedding': self.wedding,
            'title': 'Task',
            'status': self.todo,
            'priority': self.priority,
            'category': self.category,
        }
        values.update(overrides)
        return Task.objects.create(**values)

    def test_update_rejects_dependency_cycle(self):
        first = self.make_task(title='First')
        second = self.make_task(title='Second')
        first.depends_on.add(second)

        response = self.client.patch(
            f'/api/tasks/tasks/{second.pk}/',
            {'depends_on': [first.pk]},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        second.refresh_from_db()
        self.assertFalse(second.depends_on.exists())

    def test_board_groups_tasks_by_category_and_status(self):
        task = self.make_task(title='Seat guests')

        response = self.client.get(f'/api/tasks/tasks/board/?category={self.category.pk}')

        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['selected_category']['id'], self.category.pk)
        column = next(item for item in data['columns'] if item['task_status']['id'] == self.todo.pk)
        self.assertEqual([item['id'] for item in column['tasks']], [task.pk])

    def test_template_instantiation_uses_anchor_date_offsets(self):
        template = TaskTemplate.objects.create(name='Planning essentials')
        TaskTemplateItem.objects.create(
            template=template,
            title='Book photographer',
            offset_days=-10,
            priority=self.priority,
            category=self.category,
        )
        anchor = date(2027, 5, 20)

        response = self.client.post(
            '/api/tasks/tasks/from-template/',
            {'template_id': template.pk, 'anchor_date': anchor.isoformat()},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        created = Task.objects.get(title='Book photographer')
        self.assertEqual(created.due_date.date(), anchor - timedelta(days=10))

    def test_recurring_completion_records_history_and_advances_due_date(self):
        due = datetime.combine(date.today(), time(12), tzinfo=datetime_timezone.utc)
        task = self.make_task(title='Weekly check-in', due_date=due, recurrence='weekly')

        response = self.client.post(f'/api/tasks/tasks/{task.pk}/complete-occurrence/')

        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        occurrence = TaskOccurrence.objects.get(task=task)
        self.assertEqual(occurrence.outcome, 'completed')
        self.assertEqual(task.due_date.date(), date.today() + timedelta(days=7))

    def test_comments_are_wedding_scoped_and_calendar_export_is_ical(self):
        task = self.make_task(title='Send invitations', due_date=datetime.now(datetime_timezone.utc))
        comment_response = self.client.post(
            f'/api/tasks/tasks/{task.pk}/comments/',
            {'body': 'Proofread names first'},
            format='json',
        )
        self.assertEqual(comment_response.status_code, 201)
        self.assertEqual(TaskComment.objects.get(task=task).author, self.user)

        calendar_response = self.client.get('/api/tasks/tasks/export/ical/')
        self.assertEqual(calendar_response.status_code, 200)
        self.assertTrue(calendar_response['Content-Type'].startswith('text/calendar'))
        self.assertIn('SUMMARY:Send invitations', calendar_response.content.decode())

    def test_dependency_endpoint_returns_chain(self):
        prerequisite = self.make_task(title='Choose venue')
        task = self.make_task(title='Confirm caterer')
        task.depends_on.add(prerequisite)

        response = self.client.get(f'/api/tasks/tasks/{task.pk}/dependencies/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['dependencies'][0]['id'], prerequisite.pk)


class TimelineConflictApiTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate()
        self.timeline = Timeline.objects.create(wedding=self.wedding, name='Wedding day')

    def test_conflicts_detect_overlapping_events_and_export_calendar(self):
        event_date = date.today() + timedelta(days=1)
        TimelineEvent.objects.create(
            timeline=self.timeline, wedding=self.wedding, title='Hair and makeup',
            date=event_date, time=time(9), end_time=time(10),
        )
        TimelineEvent.objects.create(
            timeline=self.timeline, wedding=self.wedding, title='Photographer arrival',
            date=event_date, time=time(9, 30), end_time=time(10, 30),
        )

        conflict_response = self.client.get('/api/timeline/timeline-events/conflicts/')
        self.assertEqual(conflict_response.status_code, 200)
        self.assertEqual(len(conflict_response.json()['data']), 1)

        calendar_response = self.client.get('/api/timeline/timeline-events/export/ical/')
        self.assertEqual(calendar_response.status_code, 200)
        self.assertIn('SUMMARY:Hair and makeup', calendar_response.content.decode())