from django.urls import path
from . import views

urlpatterns = [
    path('', views.VendorListCreateView.as_view(), name='vendor-list-create'),
    path('<int:pk>/', views.VendorDetailView.as_view(), name='vendor-detail'),
    path('bulk-status-update/', views.vendor_bulk_status_update, name='vendor-bulk-status-update'),
    path('statistics/', views.vendor_statistics, name='vendor-statistics'),
    path('follow-ups/', views.vendor_follow_ups, name='vendor-follow-ups'),
    path('<int:pk>/mark-contacted/', views.vendor_mark_contacted, name='vendor-mark-contacted'),
]
