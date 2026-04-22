from django.urls import path
from . import views

app_name = 'wedding_cards'

urlpatterns = [
    path('', views.WeddingCardListCreateView.as_view(), name='card-list-create'),
    path('<int:pk>/', views.WeddingCardDetailView.as_view(), name='card-detail'),
    path('<int:card_id>/guests/', views.WeddingCardGuestListCreateView.as_view(), name='card-guest-list-create'),
    path('<int:card_id>/guests/<int:pk>/', views.WeddingCardGuestDetailView.as_view(), name='card-guest-detail'),
    path('<int:card_id>/analytics/', views.wedding_card_analytics, name='card-analytics'),
    path('<int:card_id>/guests/<int:guest_id>/upload-photo/', views.wedding_card_upload_photo, name='card-guest-upload-photo'),
    path('<int:card_id>/export/', views.wedding_card_guests_export, name='card-guests-export'),
]
