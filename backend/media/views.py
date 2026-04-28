from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Media, MediaType, Album, MediaAlbum, AlbumTag
from .serializers import (
    MediaSerializer, MediaCreateSerializer, MediaUpdateSerializer,
    MediaTypeSerializer, AlbumSerializer, AlbumListSerializer, AlbumCreateSerializer,
    AlbumUpdateSerializer, MediaAlbumSerializer, AlbumTagSerializer
)
from utils.api_response import APIResponse


class MediaTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaType model"""
    queryset = MediaType.objects.all()
    serializer_class = MediaTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Media types retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Media type created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Media type retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Media type updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Media type deleted successfully")


class AlbumViewSet(viewsets.ModelViewSet):
    """ViewSet for Album model"""
    queryset = Album.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'featured']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'title', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        return Album.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AlbumListSerializer
        elif self.action == 'create':
            return AlbumCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AlbumUpdateSerializer
        return AlbumSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Albums retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full album data
        album = Album.objects.get(pk=serializer.instance.pk)
        response_serializer = AlbumSerializer(album)
        return APIResponse.created(response_serializer.data, "Album created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Album retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full album data
        album = Album.objects.get(pk=serializer.instance.pk)
        response_serializer = AlbumSerializer(album)
        return APIResponse.success(response_serializer.data, "Album updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Album deleted successfully")
    
    @action(detail=True, methods=['post'])
    def add_media(self, request, pk=None):
        """Add media items to album"""
        album = self.get_object()
        media_ids = request.data.get('media_ids', [])
        
        if not media_ids:
            return APIResponse.error(
                "media_ids are required",
                ["Missing required field: media_ids"],
                status.HTTP_400_BAD_REQUEST
            )
        
        added_count = 0
        for media_id in media_ids:
            try:
                media = Media.objects.get(id=media_id, wedding=request.user.wedding)
                MediaAlbum.objects.get_or_create(album=album, media=media)
                added_count += 1
            except Media.DoesNotExist:
                continue
        
        return APIResponse.success(
            {'added_count': added_count},
            f"Added {added_count} media items to album"
        )
    
    @action(detail=True, methods=['post'])
    def remove_media(self, request, pk=None):
        """Remove media items from album"""
        album = self.get_object()
        media_ids = request.data.get('media_ids', [])
        
        if not media_ids:
            return APIResponse.error(
                "media_ids are required",
                ["Missing required field: media_ids"],
                status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = MediaAlbum.objects.filter(
            album=album,
            media_id__in=media_ids
        ).delete()[0]
        
        return APIResponse.success(
            {'removed_count': deleted_count},
            f"Removed {deleted_count} media items from album"
        )
    
    @action(detail=False, methods=['get'])
    def by_event(self, request):
        """Get albums grouped by event type"""
        albums = self.get_queryset()
        
        result = {}
        for event_key, event_name in Album.EVENT_CHOICES:
            event_albums = albums.filter(event_type=event_key)
            result[event_key] = {
                'name': event_name,
                'count': event_albums.count(),
                'albums': AlbumListSerializer(event_albums, many=True).data
            }
        
        return APIResponse.success(result, "Albums by event type retrieved successfully")
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured albums"""
        albums = self.get_queryset().filter(featured=True)
        serializer = AlbumListSerializer(albums, many=True)
        return APIResponse.success(serializer.data, "Featured albums retrieved successfully")


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
