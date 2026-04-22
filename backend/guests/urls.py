from django.urls import path
from . import views

urlpatterns = [
    path('', views.GuestListCreateView.as_view(), name='guest-list-create'),
    path('bulk/', views.GuestBulkCreateView.as_view(), name='guest-bulk-create'),
    path('<int:pk>/', views.GuestDetailView.as_view(), name='guest-detail'),
    path('bulk-rsvp-update/', views.guest_bulk_rsvp_update, name='guest-bulk-rsvp-update'),
    path('send-invitations/', views.guest_send_invitations, name='guest-send-invitations'),
    path('statistics/', views.guest_statistics, name='guest-statistics'),
    path('export/', views.guest_export, name='guest-export'),
]
