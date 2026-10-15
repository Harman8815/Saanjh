from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'roles', views.RoleViewSet)
router.register(r'settings', views.SettingsViewSet, basename='settings')

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.UserLogoutView.as_view(), name='user-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('refresh/', views.refresh_token, name='user-refresh'),
    path('change-password/', views.change_password, name='change-password'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('sessions/', views.session_list, name='session-list'),
    path('sessions/<uuid:session_id>/revoke/', views.session_revoke, name='session-revoke'),
    path('users/', views.users_list, name='users-list'),
    path('stats/', views.user_stats, name='user-stats'),
    path('settings/', views.user_settings_detail, name='user-settings-detail'),
    path('settings-detail/', views.user_settings_detail, name='user-settings-detail-old'),
    path('', include(router.urls)),
]
