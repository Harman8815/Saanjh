from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'documents', views.DocumentViewSet)
router.register(r'categories', views.DocumentCategoryViewSet)
router.register(r'tags', views.DocumentTagViewSet)

urlpatterns = [
    path('', views.DocumentListCreateView.as_view(), name='document-list-create'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('<int:pk>/download/', views.document_download, name='document-download'),
    path('statistics/', views.document_statistics, name='document-statistics'),
    path('', include(router.urls)),
]
