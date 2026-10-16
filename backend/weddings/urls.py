from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'weddings', views.WeddingViewSet)
router.register(r'wedding-status', views.WeddingStatusViewSet)
router.register(r'venues', views.VenueViewSet)
router.register(r'venue-catalog', views.VenueCatalogViewSet)
router.register(r'venue-amenities', views.VenueAmenityViewSet)

urlpatterns = [
    path('', views.WeddingDetailView.as_view(), name='wedding-detail'),
    path('create/', views.WeddingCreateView.as_view(), name='wedding-create'),
    path('dashboard/', views.wedding_dashboard, name='wedding-dashboard'),
    path('timeline/', views.wedding_timeline, name='wedding-timeline'),
    path('venue-search/', views.venue_search, name='venue-search'),
    path(
        'saved-venues/<int:venue_id>/toggle/',
        views.wedding_toggle_saved_venue,
        name='wedding-toggle-saved-venue'
    ),
    path('saved-venues/', views.wedding_saved_venues, name='wedding-saved-venues'),
    path('', include(router.urls)),
]
