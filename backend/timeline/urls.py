from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'timelines', views.TimelineViewSet)
router.register(r'timeline-events', views.TimelineEventViewSet)
router.register(r'timeline-status', views.TimelineStatusViewSet)

urlpatterns = [
    path('my-timeline/', views.my_timeline, name='my-timeline'),
    path('', include(router.urls)),
]
