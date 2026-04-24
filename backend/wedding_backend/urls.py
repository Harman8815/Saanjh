"""
URL configuration for wedding_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from . import views
from internal_admin.views import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/weddings/', include('weddings.urls')),
    path('api/guests/', include('guests.urls')),
    path('api/vendors/', include('vendors.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/wedding-cards/', include('wedding_cards.urls')),
    path('api/timeline/', include('timeline.urls')),
    path('api/media/', include('media.urls')),
    path('api/public/cards/<str:shareable_link>/', include('wedding_cards.public_urls')),
    # Fake data generation endpoints (admin only)
    path('api/admin/generate-fake-data/', views.generate_fake_data, name='generate-fake-data'),
    path('api/admin/generate-sample-wedding/', views.generate_sample_wedding, name='generate-sample-wedding'),
    path('api/admin/create-default-accounts/', views.create_default_accounts, name='create-default-accounts'),
    path('api/admin/clear-fake-data/', views.clear_fake_data, name='clear-fake-data'),
    path('api/admin/data-statistics/', views.data_statistics, name='data-statistics'),
]
