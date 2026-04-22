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
    path('stats/', views.user_stats, name='user-stats'),
    path('settings-detail/', views.user_settings_detail, name='user-settings-detail'),
    path('', include(router.urls)),
]
