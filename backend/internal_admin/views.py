from django.shortcuts import render


def home(request):
    """Home page for the wedding backend"""
    return render(request, 'internal_admin/home.html')
