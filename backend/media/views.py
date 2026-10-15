from rest_framework import generics, permissions, status, viewsets, parsers
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
from .serializers import _optimize_image
from wedding_cards.models import WeddingCard
from utils.api_response import APIResponse
from utils.api_response import get_request_wedding
from accounts.permissions import IsAdminOrReadOnly


class MediaTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaType model"""
    queryset = MediaType.objects.all()
    serializer_class = MediaTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
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

    @action(detail=False, methods=['get'])
    def tags(self, request):
        tags = AlbumTag.objects.filter(wedding=request.user.wedding).order_by('name')
        return APIResponse.success(AlbumTagSerializer(tags, many=True).data, 'Album tags retrieved successfully')


class MediaViewSet(viewsets.ModelViewSet):
    """ViewSet for Media model"""
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['media_type']
    search_fields = ['title']
    ordering_fields = ['uploaded_at', 'title']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        queryset = Media.objects.filter(wedding=self.request.user.wedding)
        submission_status = self.request.query_params.get('submission_status')
        if submission_status:
            queryset = queryset.filter(submission_status=submission_status)
        return queryset
    
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
        media_files = self.get_queryset().filter(
            media_type__name__in=['photo', 'video'],
            submission_status='approved',
        )
        serializer = self.get_serializer(media_files, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        files = request.FILES.getlist('files')
        if not files:
            return APIResponse.error('Files are required', ['Attach one or more files under the files field'], status.HTTP_400_BAD_REQUEST)
        media_type = MediaType.objects.filter(pk=request.data.get('media_type_id')).first() if request.data.get('media_type_id') else MediaType.objects.filter(name__iexact='photo').first()
        if not media_type:
            return APIResponse.error('Photo media type is not configured', ['Create a photo media type before uploading'], status.HTTP_400_BAD_REQUEST)

        results = []
        for upload in files:
            serializer = MediaCreateSerializer(
                data={'title': upload.name, 'file': upload, 'media_type_id': media_type.pk},
                context={'request': request},
            )
            if not serializer.is_valid():
                results.append({'file': upload.name, 'success': False, 'errors': serializer.errors})
                continue
            media = serializer.save()
            results.append({
                'file': upload.name,
                'success': True,
                'media': MediaSerializer(media, context={'request': request}).data,
            })
        return APIResponse.success({
            'results': results,
            'success_count': sum(result['success'] for result in results),
            'failed_count': sum(not result['success'] for result in results),
        }, 'Media upload batch processed successfully')

    @action(detail=False, methods=['get'], url_path='guest-submissions')
    def guest_submissions(self, request):
        submissions = self.get_queryset().filter(is_guest_submission=True)
        requested_status = request.query_params.get('status')
        if requested_status in {'pending', 'approved', 'rejected'}:
            submissions = submissions.filter(submission_status=requested_status)
        data = MediaSerializer(submissions, many=True, context={'request': request}).data
        return APIResponse.success(data, 'Guest submissions retrieved successfully')

    @action(detail=True, methods=['post'], url_path='moderate-submission')
    def moderate_submission(self, request, pk=None):
        media = self.get_object()
        if not media.is_guest_submission:
            return APIResponse.error('Not a guest submission', ['Only guest submissions can be moderated'], status.HTTP_400_BAD_REQUEST)
        new_status = request.data.get('status')
        if new_status not in {'approved', 'rejected'}:
            return APIResponse.error('Invalid status', ['Choose approved or rejected'], status.HTTP_400_BAD_REQUEST)
        media.submission_status = new_status
        media.save(update_fields=['submission_status'])
        return APIResponse.success(MediaSerializer(media, context={'request': request}).data, 'Guest submission updated successfully')

    @action(
        detail=False,
        methods=['post'],
        url_path='guest-submissions/submit',
        permission_classes=[permissions.AllowAny],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def submit_guest_photo(self, request):
        card = WeddingCard.objects.select_related('wedding').filter(
            shareable_link=request.data.get('shareable_link'),
            allow_guest_photos=True,
        ).first()
        if not card:
            return APIResponse.error('Guest photo submissions are unavailable', ['Check the wedding link or photo permissions'], status.HTTP_404_NOT_FOUND)
        upload = request.FILES.get('file')
        try:
            from utils.uploads import validate_uploaded_file
            validate_uploaded_file(upload, group='images')
        except Exception as error:
            return APIResponse.error('Invalid image', [str(error)], status.HTTP_400_BAD_REQUEST)
        if not upload:
            return APIResponse.error('Image is required', ['Attach an image file'], status.HTTP_400_BAD_REQUEST)
        photo_type = MediaType.objects.filter(name__iexact='photo').first()
        if not photo_type:
            return APIResponse.error('Photo media type is not configured', ['Contact the wedding organizer'], status.HTTP_400_BAD_REQUEST)
        media = Media.objects.create(
            wedding=card.wedding,
            media_type=photo_type,
            title=upload.name,
            is_guest_submission=True,
            submitted_by_name=(request.data.get('name') or '').strip()[:150],
            submitted_by_email=(request.data.get('email') or '').strip(),
            submission_status='pending',
        )
        _optimize_image(media, upload)
        return APIResponse.created({'id': media.pk, 'submission_status': media.submission_status}, 'Photo submitted for approval')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def media_statistics(request):
    """Get media statistics for the wedding"""
    try:
        wedding = get_request_wedding(request)
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
