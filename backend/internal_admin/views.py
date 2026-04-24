from django.shortcuts import render


def home(request):
    """Home page for the wedding backend"""
    return render(request, 'internal_admin/home.html')


def api_docs(request):
    """Custom API documentation page with enhanced UI"""
    return render(request, 'internal_admin/api_docs.html')
