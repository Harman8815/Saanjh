from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'guests', views.GuestViewSet)
router.register(r'rsvp-status', views.RsvpStatusViewSet)
router.register(r'tables', views.TableViewSet)
router.register(r'meals', views.MealViewSet)
router.register(r'groups', views.GuestGroupViewSet, basename='guest-group')
router.register(r'dietary-options', views.DietaryOptionViewSet, basename='dietary-option')

urlpatterns = [
    path('', views.GuestListCreateView.as_view(), name='guest-list-create'),
    path('bulk/', views.GuestBulkCreateView.as_view(), name='guest-bulk-create'),
    path('<int:pk>/', views.GuestDetailView.as_view(), name='guest-detail'),
    path('bulk-rsvp-update/', views.guest_bulk_rsvp_update, name='guest-bulk-rsvp-update'),
    path('bulk-update/', views.guest_bulk_update, name='guest-bulk-update'),
    path('send-invitations/', views.guest_send_invitations, name='guest-send-invitations'),
    path('statistics/', views.guest_statistics, name='guest-statistics'),
    path('export/', views.guest_export, name='guest-export'),
    path('duplicates/', views.guest_duplicates, name='guest-duplicates'),
    path('import/preview/', views.guest_import_preview, name='guest-import-preview'),
    path('import/', views.guest_import_commit, name='guest-import-commit'),
    path('import-template/', views.guest_import_template, name='guest-import-template'),
    path('reminders/schedule/', views.guest_reminders_schedule, name='guest-reminders-schedule'),
    path('seating/auto-assign/', views.seating_auto_assign, name='seating-auto-assign'),
    path('seating-chart/', views.seating_chart, name='seating-chart'),
    path('', include(router.urls)),
]
