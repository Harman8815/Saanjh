from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Media, MediaType
from .serializers import (
    MediaSerializer, MediaCreateSerializer, MediaUpdateSerializer,
    MediaTypeSerializer
)


class MediaTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaType model"""
    queryset = MediaType.objects.all()
    serializer_class = MediaTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class MediaViewSet(viewsets.ModelViewSet):
    """ViewSet for Media model"""
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['media_type']
    search_fields = ['title']
    ordering_fields = ['uploaded_at', 'title']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        return Media.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MediaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MediaUpdateSerializer
        return MediaSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get media files by type"""
        media_type_id = request.GET.get('media_type_id')
        if not media_type_id:
            return Response(
                {'error': 'media_type_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        media_files = self.get_queryset().filter(media_type_id=media_type_id)
        serializer = self.get_serializer(media_files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def gallery(self, request):
        """Get gallery view of media files"""
        media_files = self.get_queryset().filter(media_type__name__in=['photo', 'video'])
        serializer = self.get_serializer(media_files, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def media_statistics(request):
    """Get media statistics for the wedding"""
    try:
        wedding = request.user.wedding
        media_files = wedding.media_files.all()
        
        # Group by media type
        type_counts = {}
        for media_type in MediaType.objects.all():
            type_counts[media_type.name] = media_files.filter(
                media_type=media_type
            ).count()
        
        # Total files and storage
        total_files = media_files.count()
        total_size = sum(
            media.file_size or 0 for media in media_files
        )
        
        return Response({
            'total_files': total_files,
            'total_size': total_size,
            'type_counts': type_counts,
            'recent_uploads': MediaSerializer(
                media_files.order_by('-uploaded_at')[:10],
                many=True
            ).data
        })
    except:
        return Response({
            'total_files': 0,
            'total_size': 0,
            'type_counts': {},
            'recent_uploads': []
        })
