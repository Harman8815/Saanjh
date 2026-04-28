from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'statuses', views.TaskStatusViewSet, basename='task-status')
router.register(r'priorities', views.TaskPriorityViewSet, basename='task-priority')
router.register(r'categories', views.TaskCategoryViewSet, basename='task-category')
router.register(r'tasks', views.TaskViewSet, basename='task')

app_name = 'tasks'

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/statistics/', views.task_statistics, name='task-statistics'),
]
