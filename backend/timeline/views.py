from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Timeline, TimelineEvent, TimelineStatus
from .serializers import (
    TimelineSerializer, TimelineCreateSerializer,
    TimelineEventSerializer, TimelineEventCreateSerializer,
    TimelineEventUpdateSerializer, TimelineStatusSerializer
)


class TimelineStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for TimelineStatus model"""
    queryset = TimelineStatus.objects.all()
    serializer_class = TimelineStatusSerializer
    permission_classes = [permissions.IsAuthenticated]


class TimelineEventViewSet(viewsets.ModelViewSet):
    """ViewSet for TimelineEvent model"""
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'event_date']
    search_fields = ['title']
    ordering_fields = ['event_date', 'start_time', 'title']
    ordering = ['event_date', 'start_time']
    
    def get_queryset(self):
        # Get events for the current user's wedding timeline
        try:
            wedding = self.request.user.wedding
            timeline = wedding.timeline
            return TimelineEvent.objects.filter(timeline=timeline)
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
        upcoming_events = self.get_queryset().filter(event_date__gte=today)
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past events"""
        from django.utils import timezone
        today = timezone.now().date()
        past_events = self.get_queryset().filter(event_date__lt=today)
        serializer = self.get_serializer(past_events, many=True)
        return Response(serializer.data)


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
        wedding = request.user.wedding
        timeline, created = Timeline.objects.get_or_create(
            wedding=wedding,
            defaults={'name': f"{wedding.get_couple_name() or 'Wedding'} Timeline"}
        )
        serializer = TimelineSerializer(timeline)
        return Response(serializer.data)
    except:
        return Response({'error': 'No wedding found'}, status=status.HTTP_404_NOT_FOUND)
