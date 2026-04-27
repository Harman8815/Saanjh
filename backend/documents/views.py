from rest_framework import generics, permissions, status, viewsets, parsers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from .models import Document, DocumentCategory, DocumentTag
from .serializers import (
    DocumentSerializer, DocumentCreateSerializer, DocumentUpdateSerializer,
    DocumentListSerializer, DocumentCategorySerializer, DocumentTagSerializer
)
from utils.api_response import APIResponse


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentCategory model"""
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Document categories retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Document category created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Document category retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Document category updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Document category deleted successfully")


class DocumentTagViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentTag model"""
    queryset = DocumentTag.objects.all()
    serializer_class = DocumentTagSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Document tags retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Document tag created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Document tag retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Document tag updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Document tag deleted successfully")


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for Document model"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['uploaded_at', 'name', 'file_size']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        return Document.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DocumentUpdateSerializer
        elif self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding, uploaded_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by tags if provided
        tags = request.query_params.getlist('tags')
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Documents retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full document data
        document = Document.objects.get(pk=serializer.instance.pk)
        response_serializer = DocumentSerializer(document, context={'request': request})
        return APIResponse.created(response_serializer.data, "Document uploaded successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Document retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full document data
        document = Document.objects.get(pk=serializer.instance.pk)
        response_serializer = DocumentSerializer(document, context={'request': request})
        return APIResponse.success(response_serializer.data, "Document updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Document deleted successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete documents"""
        document_ids = request.data.get('document_ids', [])
        
        if not document_ids:
            return APIResponse.error(
                "document_ids are required",
                ["Missing required field: document_ids"],
                status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = Document.objects.filter(
            id__in=document_ids,
            wedding=request.user.wedding
        ).delete()[0]
        
        return APIResponse.success({
            'deleted_count': deleted_count
        }, f"Deleted {deleted_count} documents successfully")
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get documents grouped by category"""
        documents = self.get_queryset()
        
        result = {}
        for category_key, category_name in Document.CATEGORY_CHOICES:
            category_docs = documents.filter(category=category_key)
            result[category_key] = {
                'name': category_name,
                'count': category_docs.count(),
                'documents': DocumentListSerializer(
                    category_docs[:10],
                    many=True,
                    context={'request': request}
                ).data
            }
        
        return APIResponse.success(result, "Documents by category retrieved successfully")
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get document statistics"""
        documents = self.get_queryset()
        
        # Total stats
        total_count = documents.count()
        total_size = sum(doc.file_size or 0 for doc in documents)
        
        # By category
        category_stats = {}
        for category_key, category_name in Document.CATEGORY_CHOICES:
            category_docs = documents.filter(category=category_key)
            category_stats[category_key] = {
                'name': category_name,
                'count': category_docs.count(),
                'size': sum(doc.file_size or 0 for doc in category_docs)
            }
        
        # Recent uploads
        recent_uploads = DocumentListSerializer(
            documents[:10],
            many=True,
            context={'request': request}
        ).data
        
        return APIResponse.success({
            'total_count': total_count,
            'total_size': total_size,
            'total_size_display': self._format_file_size(total_size),
            'by_category': category_stats,
            'recent_uploads': recent_uploads
        }, "Document statistics retrieved successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_update_tags(self, request):
        """Bulk update tags for multiple documents"""
        document_ids = request.data.get('document_ids', [])
        tag_names = request.data.get('tag_names', [])
        
        if not document_ids:
            return APIResponse.error(
                "document_ids are required",
                ["Missing required field: document_ids"],
                status.HTTP_400_BAD_REQUEST
            )
        
        documents = Document.objects.filter(
            id__in=document_ids,
            wedding=request.user.wedding
        )
        
        # Create tags if they don't exist
        tags = []
        for tag_name in tag_names:
            tag, created = DocumentTag.objects.get_or_create(name=tag_name.lower().strip())
            tags.append(tag)
        
        # Update tags for all documents
        for document in documents:
            document.tags.set(tags)
        
        return APIResponse.success({
            'updated_count': documents.count()
        }, f"Updated tags for {documents.count()} documents successfully")
    
    def _format_file_size(self, size):
        """Format file size for display"""
        if not size:
            return '0 B'
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"


class DocumentListCreateView(generics.ListCreateAPIView):
    """Document list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['uploaded_at', 'name', 'file_size']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        return Document.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentCreateSerializer
        return DocumentListSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding, uploaded_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by tags if provided
        tags = request.query_params.getlist('tags')
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return APIResponse.success(serializer.data, "Documents retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full document data
        document = Document.objects.get(pk=serializer.instance.pk)
        response_serializer = DocumentSerializer(document, context={'request': request})
        return APIResponse.created(response_serializer.data, "Document uploaded successfully")


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Document detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def get_queryset(self):
        return Document.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DocumentUpdateSerializer
        return DocumentSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return APIResponse.success(serializer.data, "Document retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full document data
        document = Document.objects.get(pk=serializer.instance.pk)
        response_serializer = DocumentSerializer(document, context={'request': request})
        return APIResponse.success(response_serializer.data, "Document updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Document deleted successfully")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def document_statistics(request):
    """Get document statistics"""
    documents = Document.objects.filter(wedding=request.user.wedding)
    
    # Total stats
    total_count = documents.count()
    total_size = sum(doc.file_size or 0 for doc in documents)
    
    # By category
    category_stats = {}
    for category_key, category_name in Document.CATEGORY_CHOICES:
        category_docs = documents.filter(category=category_key)
        category_stats[category_key] = {
            'name': category_name,
            'count': category_docs.count(),
            'size': sum(doc.file_size or 0 for doc in category_docs)
        }
    
    return APIResponse.success({
        'total_count': total_count,
        'total_size': total_size,
        'by_category': category_stats
    }, "Document statistics retrieved successfully")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def document_download(request, pk):
    """Download a document"""
    try:
        document = Document.objects.get(pk=pk, wedding=request.user.wedding)
        
        if not document.file:
            return APIResponse.error(
                "File not found",
                ["The document file is missing"],
                status.HTTP_404_NOT_FOUND
            )
        
        from django.http import FileResponse
        return FileResponse(
            document.file.open(),
            as_attachment=True,
            filename=document.name
        )
    except Document.DoesNotExist:
        return APIResponse.error(
            "Document not found",
            ["The requested document does not exist"],
            status.HTTP_404_NOT_FOUND
        )
