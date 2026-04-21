from django.urls import path
from . import views

urlpatterns = [
    path('', views.WeddingDetailView.as_view(), name='wedding-detail'),
    path('create/', views.WeddingCreateView.as_view(), name='wedding-create'),
    path('dashboard/', views.wedding_dashboard, name='wedding-dashboard'),
    path('timeline/', views.wedding_timeline, name='wedding-timeline'),
]
