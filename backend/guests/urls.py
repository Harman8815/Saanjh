from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'guests', views.GuestViewSet)
router.register(r'rsvp-status', views.RsvpStatusViewSet)
router.register(r'tables', views.TableViewSet)
router.register(r'meals', views.MealViewSet)

urlpatterns = [
    path('', views.GuestListCreateView.as_view(), name='guest-list-create'),
    path('bulk/', views.GuestBulkCreateView.as_view(), name='guest-bulk-create'),
    path('<int:pk>/', views.GuestDetailView.as_view(), name='guest-detail'),
    path('bulk-rsvp-update/', views.guest_bulk_rsvp_update, name='guest-bulk-rsvp-update'),
    path('send-invitations/', views.guest_send_invitations, name='guest-send-invitations'),
    path('statistics/', views.guest_statistics, name='guest-statistics'),
    path('export/', views.guest_export, name='guest-export'),
    path('seating-chart/', views.seating_chart, name='seating-chart'),
    path('', include(router.urls)),
]
