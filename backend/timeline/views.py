from utils.api_response import get_request_wedding
from accounts.permissions import IsAdminOrReadOnly
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse
from django.utils import timezone
from datetime import datetime
from .models import Timeline, TimelineEvent, TimelineStatus
from .serializers import (
    TimelineSerializer, TimelineCreateSerializer,
    TimelineEventSerializer, TimelineEventCreateSerializer,
    TimelineEventUpdateSerializer, TimelineStatusSerializer
)
from utils.api_response import APIResponse


class TimelineStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for TimelineStatus model"""
    queryset = TimelineStatus.objects.all()
    serializer_class = TimelineStatusSerializer
    permission_classes = [IsAdminOrReadOnly]


class TimelineEventViewSet(viewsets.ModelViewSet):
    """ViewSet for TimelineEvent model"""
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'date', 'type', 'priority']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['date', 'time', 'title', 'priority']
    ordering = ['date', 'time']

    def get_queryset(self):
        # Get events for the current user's wedding timeline
        try:
            wedding = get_request_wedding(self.request)
            timeline = wedding.timeline
            queryset = TimelineEvent.objects.filter(timeline=timeline)

            # Optional filtering by month, day, week, or date range
            month = self.request.query_params.get('month')
            day = self.request.query_params.get('day')
            week = self.request.query_params.get('week')
            start_date = self.request.query_params.get('start_date')
            end_date = self.request.query_params.get('end_date')

            if month:
                from django.utils import timezone
                try:
                    month_date = timezone.datetime.strptime(month, '%Y-%m').date()
                    queryset = queryset.filter(
                        date__year=month_date.year,
                        date__month=month_date.month
                    )
                except ValueError:
                    pass

            if day:
                from django.utils import timezone
                try:
                    day_date = timezone.datetime.strptime(day, '%Y-%m-%d').date()
                    queryset = queryset.filter(date=day_date)
                except ValueError:
                    pass

            if week:
                from django.utils import timezone
                from datetime import timedelta
                try:
                    week_date = timezone.datetime.strptime(week, '%Y-%W').date()
                    # Get the start of the week (Monday)
                    start_of_week = week_date - timedelta(days=week_date.weekday())
                    end_of_week = start_of_week + timedelta(days=6)
                    queryset = queryset.filter(date__range=[start_of_week, end_of_week])
                except ValueError:
                    pass

            if start_date and end_date:
                from django.utils import timezone
                try:
                    start = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
                    end = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
                    queryset = queryset.filter(date__range=[start, end])
                except ValueError:
                    pass

            return queryset
        except:
            return TimelineEvent.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TimelineEventCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TimelineEventUpdateSerializer
        return TimelineEventSerializer

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        from django.utils import timezone
        today = timezone.now().date()
        upcoming_events = self.get_queryset().filter(date__gte=today)
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past events"""
        from django.utils import timezone
        today = timezone.now().date()
        past_events = self.get_queryset().filter(date__lt=today)
        serializer = self.get_serializer(past_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conflicts(self, request):
        events = list(
            self.get_queryset().filter(date__isnull=False, time__isnull=False)
            .order_by('date', 'time', 'id')
        )
        conflicts = []
        for index, first in enumerate(events):
            first_start = first.time
            first_end = first.end_time or first_start
            for second in events[index + 1:]:
                if second.date != first.date:
                    if second.date > first.date:
                        break
                    continue
                second_start = second.time
                second_end = second.end_time or second_start
                if first_start == first_end and second_start == second_end:
                    overlaps = first_start == second_start
                elif first_start == first_end:
                    overlaps = second_start <= first_start < second_end
                elif second_start == second_end:
                    overlaps = first_start <= second_start < first_end
                else:
                    overlaps = first_start < second_end and second_start < first_end
                if overlaps:
                    conflicts.append({
                        'date': first.date,
                        'overlap_start': max(first_start, second_start),
                        'overlap_end': min(first_end, second_end),
                        'events': TimelineEventSerializer([first, second], many=True).data,
                    })
        return APIResponse.success(conflicts, 'Timeline conflicts retrieved successfully')

    @action(detail=False, methods=['get'], url_path='export/ical')
    def export_ical(self, request):
        lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Planner//Timeline//EN', 'CALSCALE:GREGORIAN']
        for event in self.get_queryset().filter(date__isnull=False):
            lines.extend([
                'BEGIN:VEVENT',
                f'UID:timeline-{event.pk}@wedding-planner',
                f"DTSTAMP:{timezone.now().strftime('%Y%m%dT%H%M%SZ')}",
            ])
            if event.time:
                start = datetime.combine(event.date, event.time)
                end = datetime.combine(event.date, event.end_time or event.time)
                lines.append(f'DTSTART:{start.strftime("%Y%m%dT%H%M%S")}')
                if end > start:
                    lines.append(f'DTEND:{end.strftime("%Y%m%dT%H%M%S")}')
            else:
                lines.append(f'DTSTART;VALUE=DATE:{event.date.strftime("%Y%m%d")}')
            title = (event.title or '').replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')
            lines.extend([f'SUMMARY:{title}', 'END:VEVENT'])
        lines.append('END:VCALENDAR')
        response = HttpResponse('\r\n'.join(lines) + '\r\n', content_type='text/calendar; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="timeline.ics"'
        return response


class TimelineViewSet(viewsets.ModelViewSet):
    """ViewSet for Timeline model"""
    queryset = Timeline.objects.all()
    serializer_class = TimelineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Timeline.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TimelineCreateSerializer
        return TimelineSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    @action(detail=True, methods=['post'])
    def add_event(self, request, pk=None):
        """Add an event to this timeline"""
        timeline = self.get_object()
        serializer = TimelineEventCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(timeline=timeline)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def events_summary(self, request, pk=None):
        """Get summary of events for this timeline"""
        timeline = self.get_object()
        events = timeline.events.all()
        
        from django.utils import timezone
        today = timezone.now().date()
        
        summary = {
            'total_events': events.count(),
            'upcoming_events': events.filter(event_date__gte=today).count(),
            'past_events': events.filter(event_date__lt=today).count(),
            'completed_events': events.filter(status__name='completed').count(),
            'pending_events': events.filter(status__name='pending').count(),
        }
        
        return Response(summary)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_timeline(request):
    """Get current user's wedding timeline"""
    try:
        wedding = get_request_wedding(request)
        timeline, created = Timeline.objects.get_or_create(
            wedding=wedding,
            defaults={'name': f"{wedding.get_couple_name() or 'Wedding'} Timeline"}
        )
        serializer = TimelineSerializer(timeline)
        return Response(serializer.data)
    except:
        return Response({'error': 'No wedding found'}, status=status.HTTP_404_NOT_FOUND)
