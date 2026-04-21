from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import Http404
from .models import WeddingCard, WeddingCardGuest, WeddingCardAnalytics
from .serializers import (
    WeddingCardSerializer, WeddingCardCreateSerializer, WeddingCardUpdateSerializer,
    WeddingCardGuestSerializer, WeddingCardGuestCreateSerializer,
    WeddingCardAnalyticsSerializer
)

class WeddingCardListCreateView(generics.ListCreateAPIView):
    """Wedding card list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WeddingCard.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WeddingCardCreateSerializer
        return WeddingCardSerializer

class WeddingCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Wedding card detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WeddingCard.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WeddingCardUpdateSerializer
        return WeddingCardSerializer

@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Public endpoint for viewing cards
def wedding_card_public(request, shareable_link):
    """Public endpoint for viewing wedding cards"""
    try:
        card = WeddingCard.objects.get(shareable_link=shareable_link)
        
        # Increment view count
        analytics, created = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
        analytics.total_views += 1
        analytics.save()
        
        serializer = WeddingCardSerializer(card)
        return Response(serializer.data)
    except WeddingCard.DoesNotExist:
        return Response(
            {'error': 'Wedding card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

class WeddingCardGuestListCreateView(generics.ListCreateAPIView):
    """Wedding card guest list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rsvp_status']
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'rsvp_date']
    ordering = ['name']
    
    def get_queryset(self):
        card_id = self.kwargs['card_id']
        return WeddingCardGuest.objects.filter(wedding_card_id=card_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WeddingCardGuestCreateSerializer
        return WeddingCardGuestSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        card_id = self.kwargs['card_id']
        context['wedding_card'] = get_object_or_404(WeddingCard, id=card_id, wedding=self.request.user.wedding)
        return context

class WeddingCardGuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Wedding card guest detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        card_id = self.kwargs['card_id']
        return WeddingCardGuest.objects.filter(wedding_card_id=card_id)
    
    def get_serializer_class(self):
        return WeddingCardGuestSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Public RSVP endpoint
def wedding_card_public_rsvp(request, shareable_link):
    """Public endpoint for RSVP to wedding cards"""
    try:
        card = WeddingCard.objects.get(shareable_link=shareable_link)
        
        # Create or update guest RSVP
        data = request.data
        guest, created = WeddingCardGuest.objects.update_or_create(
            wedding_card=card,
            email=data.get('email'),
            defaults={
                'name': data.get('name'),
                'rsvp_status': data.get('rsvp_status', 'pending'),
                'plus_one': data.get('plus_one', False),
                'plus_one_name': data.get('plus_one_name', ''),
                'dietary_restrictions': data.get('dietary_restrictions', ''),
                'notes': data.get('notes', '')
            }
        )
        
        # Update analytics
        analytics, _ = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
        analytics.total_rsvps += 1
        if guest.rsvp_status == 'confirmed':
            analytics.confirmed_rsvps += 1
        elif guest.rsvp_status == 'declined':
            analytics.declined_rsvps += 1
        analytics.save()
        
        serializer = WeddingCardGuestSerializer(guest)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except WeddingCard.DoesNotExist:
        return Response(
            {'error': 'Wedding card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_analytics(request, card_id):
    """Get wedding card analytics"""
    try:
        card = WeddingCard.objects.get(id=card_id, wedding=request.user.wedding)
        analytics = WeddingCardAnalytics.objects.get(wedding_card=card)
        serializer = WeddingCardAnalyticsSerializer(analytics)
        return Response(serializer.data)
    except (WeddingCard.DoesNotExist, WeddingCardAnalytics.DoesNotExist):
        return Response(
            {'error': 'Wedding card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_upload_photo(request, card_id, guest_id):
    """Upload photo for wedding card guest"""
    try:
        card = WeddingCard.objects.get(id=card_id, wedding=request.user.wedding)
        guest = WeddingCardGuest.objects.get(id=guest_id, wedding_card=card)
        
        if not card.allow_guest_photos:
            return Response(
                {'error': 'Photo uploads not allowed for this card'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo_url = request.data.get('photo_url')
        if not photo_url:
            return Response(
                {'error': 'photo_url is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add photo to guest's uploaded photos
        if not guest.uploaded_photos:
            guest.uploaded_photos = []
        guest.uploaded_photos.append(photo_url)
        guest.save()
        
        # Update analytics
        analytics, _ = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
        analytics.total_photos_uploaded += 1
        analytics.save()
        
        return Response({
            'message': 'Photo uploaded successfully',
            'uploaded_photos': guest.uploaded_photos
        })
        
    except (WeddingCard.DoesNotExist, WeddingCardGuest.DoesNotExist):
        return Response(
            {'error': 'Wedding card or guest not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_guests_export(request, card_id):
    """Export wedding card guest data"""
    try:
        card = WeddingCard.objects.get(id=card_id, wedding=request.user.wedding)
        guests = card.card_guests.all()
        
        export_data = []
        for guest in guests:
            export_data.append({
                'name': guest.name,
                'email': guest.email,
                'rsvp_status': guest.get_rsvp_status_display(),
                'rsvp_date': guest.rsvp_date,
                'plus_one': guest.plus_one,
                'plus_one_name': guest.plus_one_name,
                'dietary_restrictions': guest.dietary_restrictions,
                'notes': guest.notes,
                'uploaded_photos_count': len(guest.uploaded_photos) if guest.uploaded_photos else 0,
            })
        
        return Response(export_data)
    except WeddingCard.DoesNotExist:
        return Response(
            {'error': 'Wedding card not found'},
            status=status.HTTP_404_NOT_FOUND
        )
