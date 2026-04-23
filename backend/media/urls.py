from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'media', views.MediaViewSet)
router.register(r'media-types', views.MediaTypeViewSet)

urlpatterns = [
    path('statistics/', views.media_statistics, name='media-statistics'),
    path('', include(router.urls)),
]
