from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .fixtures import generate_complete_fake_dataset, create_fake_user, create_fake_wedding, create_fake_guests, create_fake_vendors, create_fake_expenses, create_fake_wedding_card

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_fake_data(request):
    """Generate fake data for testing purposes. Admin only."""
    try:
        # Get parameters from request
        user_count = int(request.data.get('user_count', 3))
        guests_per_wedding = int(request.data.get('guests_per_wedding', 30))
        vendors_per_wedding = int(request.data.get('vendors_per_wedding', 8))
        expenses_per_wedding = int(request.data.get('expenses_per_wedding', 15))
        
        # Validate parameters
        if user_count < 1 or user_count > 10:
            return Response(
                {'error': 'user_count must be between 1 and 10'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if guests_per_wedding < 1 or guests_per_wedding > 100:
            return Response(
                {'error': 'guests_per_wedding must be between 1 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate the data
        results = generate_complete_fake_dataset(
            user_count=user_count,
            guests_per_wedding=guests_per_wedding,
            vendors_per_wedding=vendors_per_wedding,
            expenses_per_wedding=expenses_per_wedding
        )
        
        return Response({
            'message': 'Fake data generated successfully',
            'summary': {
                'users_created': len(results['users']),
                'weddings_created': len(results['weddings']),
                'guests_created': len(results['guests']),
                'vendors_created': len(results['vendors']),
                'expenses_created': len(results['expenses']),
                'wedding_cards_created': len(results['wedding_cards'])
            },
            'details': {
                'users': [{'id': u.id, 'username': u.username, 'email': u.email} for u in results['users']],
                'weddings': [{'id': w.id, 'couple_names': w.get_couple_name(), 'wedding_date': w.wedding_date} for w in results['weddings']],
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate fake data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_sample_wedding(request):
    """Generate a sample wedding for the current user (or create a new user)."""
    try:
        user_id = request.data.get('user_id')
        guest_count = int(request.data.get('guest_count', 25))
        vendor_count = int(request.data.get('vendor_count', 6))
        expense_count = int(request.data.get('expense_count', 12))
        
        # Get or create user
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': f'User with id {user_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            user = create_fake_user()
        
        # Check if user already has a wedding
        if hasattr(user, 'wedding'):
            return Response(
                {'error': 'User already has a wedding. Use a different user or delete existing wedding first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create wedding
        wedding = create_fake_wedding(user)
        
        # Create related data
        guests = create_fake_guests(wedding, guest_count)
        vendors = create_fake_vendors(wedding, vendor_count)
        expenses = create_fake_expenses(wedding, vendors, expense_count)
        wedding_card = create_fake_wedding_card(wedding)
        
        return Response({
            'message': 'Sample wedding created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'wedding': {
                'id': wedding.id,
                'couple_names': wedding.get_couple_name(),
                'wedding_date': wedding.wedding_date,
                'venue': wedding.venue,
                'budget': wedding.budget
            },
            'created_counts': {
                'guests': len(guests),
                'vendors': len(vendors),
                'expenses': len(expenses),
                'wedding_cards': 1
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate sample wedding: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def clear_fake_data(request):
    """Clear all fake data. Use with caution!"""
    try:
        from django.db import connection
        
        # Get counts before deletion
        counts_before = {
            'users': User.objects.count(),
            'weddings': User.objects.filter(wedding__isnull=False).count(),
            'guests': 0,  # Will be calculated below
            'vendors': 0,  # Will be calculated below
            'expenses': 0,  # Will be calculated below
            'wedding_cards': 0  # Will be calculated below
        }
        
        # Delete all data (will cascade delete related records)
        User.objects.all().delete()
        
        # Reset database sequence
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('accounts_user', 'weddings_wedding', 'guests_guest', 'vendors_vendor', 'expenses_expense', 'wedding_cards_weddingcard')")
        
        return Response({
            'message': 'All fake data cleared successfully',
            'deleted_counts': counts_before
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to clear fake data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def data_statistics(request):
    """Get statistics about current data in the database."""
    try:
        stats = {
            'users': User.objects.count(),
            'weddings': User.objects.filter(wedding__isnull=False).count(),
            'guests': 0,
            'vendors': 0,
            'expenses': 0,
            'wedding_cards': 0,
            'total_budget': 0,
            'total_expenses': 0
        }
        
        # Calculate detailed statistics if there are weddings
        if stats['weddings'] > 0:
            from django.db.models import Sum, Count, Avg
            
            weddings = User.objects.filter(wedding__isnull=False).select_related('wedding')
            
            for user in weddings:
                wedding = user.wedding
                stats['guests'] += wedding.guests.count()
                stats['vendors'] += wedding.vendors.count()
                stats['expenses'] += wedding.expenses.count()
                stats['wedding_cards'] += wedding.wedding_cards.count()
                stats['total_budget'] += wedding.budget or 0
                
                # Sum expenses
                expense_total = wedding.expenses.aggregate(
                    total=Sum('actual_cost')
                )['total'] or 0
                stats['total_expenses'] += expense_total
        
        return Response({
            'statistics': stats,
            'averages': {
                'guests_per_wedding': stats['guests'] / max(stats['weddings'], 1),
                'vendors_per_wedding': stats['vendors'] / max(stats['weddings'], 1),
                'expenses_per_wedding': stats['expenses'] / max(stats['weddings'], 1),
                'budget_per_wedding': stats['total_budget'] / max(stats['weddings'], 1),
                'expenses_per_budget': (stats['total_expenses'] / max(stats['total_budget'], 1)) * 100
            } if stats['weddings'] > 0 else {}
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get statistics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
