from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import send_mail
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import Http404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import WeddingCard, WeddingCardGuest, WeddingCardAnalytics
from .serializers import (
    WeddingCardSerializer, WeddingCardCreateSerializer, WeddingCardUpdateSerializer,
    WeddingCardGuestSerializer, WeddingCardGuestCreateSerializer,
    WeddingCardAnalyticsSerializer, PublicRsvpSerializer
)
from utils.api_response import APIResponse

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
    card = get_object_or_404(WeddingCard, shareable_link=shareable_link)

    # Increment view count
    analytics, created = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
    analytics.total_views += 1

    # Track unique guests in the session: the first view from a browser counts
    # as a unique guest, repeat views on the same link do not.
    if not request.session.get(f'viewed_card_{card.id}'):
        request.session[f'viewed_card_{card.id}'] = True
        analytics.unique_views += 1

    analytics.save()

    return APIResponse.success(
        WeddingCardSerializer(card).data, 'Wedding card retrieved successfully'
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
        # Scope through the card's wedding so a card id belonging to another
        # user cannot be used to read their guest list.
        return WeddingCardGuest.objects.filter(
            wedding_card_id=card_id,
            wedding_card__wedding=self.request.user.wedding
        )
    
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
        # Same wedding scoping as the list view: no cross-user access.
        return WeddingCardGuest.objects.filter(
            wedding_card_id=card_id,
            wedding_card__wedding=self.request.user.wedding
        )
    
    def get_serializer_class(self):
        return WeddingCardGuestSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Public RSVP endpoint
def wedding_card_public_rsvp(request, shareable_link):
    """Public endpoint for RSVP to wedding cards"""
    card = get_object_or_404(WeddingCard, shareable_link=shareable_link)

    # Validate all caller-supplied data: this endpoint is public, so status
    # values and free text must not be trusted.
    serializer = PublicRsvpSerializer(data=request.data)
    if not serializer.is_valid():
        return APIResponse.validation_error(serializer.errors, 'RSVP validation failed')
    data = serializer.validated_data

    # Capture the previous answer so counters stay consistent when a guest
    # changes their RSVP status.
    existing = WeddingCardGuest.objects.filter(
        wedding_card=card, email=data['email']
    ).first()
    guest, created = WeddingCardGuest.objects.update_or_create(
        wedding_card=card,
        email=data['email'],
        defaults={
            'name': data['name'],
            'rsvp_status': data['rsvp_status'],
            'plus_one': data.get('plus_one', False),
            'plus_one_name': data.get('plus_one_name', ''),
            'dietary_restrictions': data.get('dietary_restrictions', ''),
            'notes': data.get('notes', ''),
        }
    )

    # Update analytics: only count new submissions, keeping the per-status
    # counters consistent with each guest's latest answer.
    analytics, _ = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
    if created:
        analytics.total_rsvps += 1
    elif existing is not None:
        if existing.rsvp_status == 'confirmed':
            analytics.confirmed_rsvps = max(0, analytics.confirmed_rsvps - 1)
        elif existing.rsvp_status == 'declined':
            analytics.declined_rsvps = max(0, analytics.declined_rsvps - 1)
    if guest.rsvp_status == 'confirmed':
        analytics.confirmed_rsvps += 1
    elif guest.rsvp_status == 'declined':
        analytics.declined_rsvps += 1
    analytics.save()

    return APIResponse.success(
        WeddingCardGuestSerializer(guest).data,
        'RSVP submitted successfully',
        status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
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
@permission_classes([permissions.AllowAny])  # Public guest photo upload
def wedding_card_public_upload_photo(request, shareable_link):
    """Public endpoint for guests to upload their own photos.

    The guest is identified by the email they used for their RSVP, so the
    guest list is never exposed and a caller can only attach a photo to their
    own entry.
    """
    try:
        card = WeddingCard.objects.get(shareable_link=shareable_link)
    except WeddingCard.DoesNotExist:
        return Response(
            {'error': 'Wedding card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not card.allow_guest_photos:
        return Response(
            {'error': 'Photo uploads not allowed for this card'},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response(
            {'error': 'email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    guest = WeddingCardGuest.objects.filter(
        wedding_card=card, email__iexact=email
    ).first()
    if guest is None:
        return Response(
            {'error': 'No RSVP found for this email. Please RSVP first.'},
            status=status.HTTP_404_NOT_FOUND
        )

    photo_file = request.FILES.get('photo')
    if photo_file:
        existing = list(guest.uploaded_photos or [])
        path = default_storage.save(
            f'wedding_card_photos/{card.id}_{guest.id}_{len(existing)}_{photo_file.name}',
            ContentFile(photo_file.read()),
        )
        photo_url = default_storage.url(path)
        existing.append(photo_url)
        guest.uploaded_photos = existing
        guest.save(update_fields=['uploaded_photos'])
    else:
        photo_url = request.data.get('photo_url')
        if not photo_url:
            return Response(
                {'error': 'photo (file) or photo_url is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        existing = list(guest.uploaded_photos or [])
        existing.append(photo_url)
        guest.uploaded_photos = existing
        guest.save(update_fields=['uploaded_photos'])

    analytics, _ = WeddingCardAnalytics.objects.get_or_create(wedding_card=card)
    analytics.total_photos_uploaded += 1
    analytics.save()

    return APIResponse.success(
        {'uploaded_photos': guest.uploaded_photos},
        'Photo uploaded successfully',
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

        photo_file = request.FILES.get('photo')

        if photo_file:
            # Store the uploaded file under media/wedding_card_photos/ and keep
            # its URL on the guest record.
            guest.uploaded_photos = uploaded = list(guest.uploaded_photos or [])
            path = default_storage.save(
                f'wedding_card_photos/{card_id}_{guest_id}_{len(uploaded)}_{photo_file.name}',
                ContentFile(photo_file.read()),
            )
            photo_url = default_storage.url(path)
            uploaded.append(photo_url)
            guest.uploaded_photos = uploaded
            guest.save(update_fields=['uploaded_photos'])
        else:
            # Fall back to a caller-supplied URL for clients that pre-host media.
            photo_url = request.data.get('photo_url')
            if not photo_url:
                return Response(
                    {'error': 'photo (file) or photo_url is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
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
            'photo_url': photo_url,
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


def _build_shareable_link(card: WeddingCard) -> str:
    """Generate a unique slug for a wedding card."""
    import uuid
    while True:
        link = uuid.uuid4().hex[:12]
        if not WeddingCard.objects.filter(shareable_link=link).exclude(pk=card.pk).exists():
            return link


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_generate_link(request, card_id):
    """Generate (or regenerate) the public shareable link for a card"""
    card = get_object_or_404(WeddingCard, id=card_id, wedding=request.user.wedding)
    if not card.shareable_link:
        card.shareable_link = _build_shareable_link(card)
        card.save(update_fields=['shareable_link'])
    return APIResponse.success(
        {'shareable_link': card.shareable_link}, 'Shareable link ready'
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_update_link(request, card_id):
    """Regenerate the shareable link, invalidating the previous one"""
    card = get_object_or_404(WeddingCard, id=card_id, wedding=request.user.wedding)
    card.shareable_link = _build_shareable_link(card)
    card.save(update_fields=['shareable_link'])
    return APIResponse.success(
        {'shareable_link': card.shareable_link}, 'Shareable link updated'
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_disable_link(request, card_id):
    """Disable the public shareable link for a card"""
    card = get_object_or_404(WeddingCard, id=card_id, wedding=request.user.wedding)
    card.shareable_link = ''
    card.save(update_fields=['shareable_link'])
    return APIResponse.success({}, 'Shareable link disabled')


def _guest_payload(guest: WeddingCardGuest) -> dict:
    return {
        'name': guest.display_name,
        'email': guest.display_email,
    }


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_send_invitations(request, card_id):
    """Send invitation emails to the guests linked to this card"""
    card = get_object_or_404(WeddingCard, id=card_id, wedding=request.user.wedding)
    requested_ids = request.data.get('guest_ids') if isinstance(request.data, dict) else None

    guests = WeddingCardGuest.objects.filter(wedding_card=card)
    if requested_ids:
        guests = guests.filter(id__in=requested_ids)

    if not card.shareable_link:
        card.shareable_link = _build_shareable_link(card)
        card.save(update_fields=['shareable_link'])

    sent, failed = [], []
    for guest in guests:
        recipient = guest.display_email
        if not recipient:
            failed.append({'name': guest.display_name, 'reason': 'No email address'})
            continue
        try:
            # The email backend is configured in settings; in DEBUG it falls back
            # to the console so no real messages leave the machine.
            send_mail(
                subject=f"You're invited - {card.couple_names}",
                message=(
                    f"Hello {guest.display_name},\n\n"
                    f"{card.couple_names} invite you to their wedding.\n"
                    f"{card.wedding_details}\n\n"
                    f"View your invitation: "
                    f"{request.build_absolute_uri('/invite/' + card.shareable_link)}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            sent.append(_guest_payload(guest))
        except Exception as exc:  # keep sending to the remaining guests
            failed.append({'name': guest.display_name, 'reason': str(exc)})

    return APIResponse.success(
        {'sent': sent, 'failed': failed},
        f'Invitations sent to {len(sent)} guest(s)',
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def wedding_card_send_reminders(request, card_id):
    """Send RSVP reminders to guests who have not responded yet"""
    card = get_object_or_404(WeddingCard, id=card_id, wedding=request.user.wedding)
    requested_ids = request.data.get('guest_ids') if isinstance(request.data, dict) else None

    guests = WeddingCardGuest.objects.filter(wedding_card=card, rsvp_status='pending')
    if requested_ids:
        guests = guests.filter(id__in=requested_ids)

    sent, failed = [], []
    for guest in guests:
        recipient = guest.display_email
        if not recipient:
            failed.append({'name': guest.display_name, 'reason': 'No email address'})
            continue
        try:
            send_mail(
                subject=f"Reminder - {card.couple_names}",
                message=(
                    f"Hello {guest.display_name},\n\n"
                    f"A gentle reminder to RSVP for {card.couple_names}'s wedding.\n"
                    f"Respond here: "
                    f"{request.build_absolute_uri('/invite/' + card.shareable_link)}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            sent.append(_guest_payload(guest))
        except Exception as exc:
            failed.append({'name': guest.display_name, 'reason': str(exc)})

    return APIResponse.success(
        {'sent': sent, 'failed': failed},
        f'Reminders sent to {len(sent)} guest(s)',
    )
