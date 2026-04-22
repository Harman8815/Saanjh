from django.urls import path
from . import views

app_name = 'wedding_cards_public'

urlpatterns = [
    path('', views.wedding_card_public, name='card-public'),
    path('rsvp/', views.wedding_card_public_rsvp, name='card-public-rsvp'),
]
