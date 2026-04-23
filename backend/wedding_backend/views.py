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


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_default_accounts(request):
    """Create two default accounts with comprehensive sample data"""
    try:
        from django.utils import timezone
        from datetime import date, timedelta
        import random
        
        # Create first user (bride)
        bride_user = User.objects.create_user(
            username='bride_demo',
            email='bride@weddingdemo.com',
            password='Demo123!@#',
            first_name='Sarah',
            last_name='Johnson',
            is_active=True
        )
        
        # Create second user (groom)
        groom_user = User.objects.create_user(
            username='groom_demo',
            email='groom@weddingdemo.com',
            password='Demo123!@#',
            first_name='Michael',
            last_name='Johnson',
            is_active=True
        )
        
        # Assign roles
        from accounts.models import Role
        bride_role = Role.objects.get(name='bride')
        groom_role = Role.objects.get(name='groom')
        
        bride_user.role = bride_role
        bride_user.save()
        
        groom_user.role = groom_role
        groom_user.save()
        
        # Create settings for both users
        from accounts.models import Settings
        Settings.objects.create(user=bride_user)
        Settings.objects.create(user=groom_user)
        
        # Create wedding for bride user
        from weddings.models import Wedding, WeddingStatus
        wedding_status = WeddingStatus.objects.get(name='planning')
        
        bride_wedding = Wedding.objects.create(
            user=bride_user,
            wedding_date=date(2024, 6, 15),
            theme='Garden Romance',
            status=wedding_status
        )
        
        # Create venue for the wedding
        from weddings.models import Venue, VenueCatalog
        
        # Get or create a venue catalog entry
        venue_catalog, created = VenueCatalog.objects.get_or_create(
            name='Garden Paradise Venue',
            defaults={
                'type': 'garden',
                'address': '123 Garden Lane, Bloomfield, NJ 07003',
                'capacity_min': 50,
                'capacity_max': 200,
                'price': 5000.00,
                'rating': 4.8
            }
        )
        
        venue = Venue.objects.create(
            venue_catalog=venue_catalog
        )
        
        # Update wedding with venue
        bride_wedding.venue = venue
        bride_wedding.save()
        
        # Create guests
        from guests.models import Guest, RsvpStatus
        rsvp_status = RsvpStatus.objects.get(name='pending')
        
        guests = []
        guest_names = [
            ('Emily', 'Davis', 'friend'),
            ('James', 'Wilson', 'family'),
            ('Jessica', 'Brown', 'colleague'),
            ('Robert', 'Miller', 'family'),
            ('Amanda', 'Taylor', 'friend'),
            ('David', 'Anderson', 'colleague'),
            ('Lisa', 'Thomas', 'family'),
            ('Christopher', 'Jackson', 'friend'),
            ('Michelle', 'White', 'colleague'),
            ('Daniel', 'Harris', 'family')
        ]
        
        for first, last, relationship in guest_names:
            guest = Guest.objects.create(
                wedding=bride_wedding,
                first_name=first,
                last_name=last,
                relationship=relationship,
                email=f'{first.lower()}.{last.lower()}@email.com',
                phone=f'555-01{random.randint(100, 999)}',
                rsvp_status=rsvp_status
            )
            guests.append(guest)
        
        # Create vendors
        from vendors.models import Vendor, VendorStatus, VendorCatalog, VendorCategory
        vendor_status = VendorStatus.objects.get(name='pending')
        vendor_categories = VendorCategory.objects.all()
        photography_cat = vendor_categories.get(name='Photography')
        catering_cat = vendor_categories.get(name='Catering')
        florist_cat = vendor_categories.get(name='Florist')
        
        # Create sample vendors
        photo_vendor = VendorCatalog.objects.filter(category=photography_cat).first()
        catering_vendor = VendorCatalog.objects.filter(category=catering_cat).first()
        florist_vendor = VendorCatalog.objects.filter(category=florist_cat).first()
        
        vendors = []
        if photo_vendor:
            vendors.append(Vendor.objects.create(
                wedding=bride_wedding,
                vendor_catalog=photo_vendor,
                status=vendor_status,
                cost_estimate=2500.00,
                actual_cost=2800.00
            ))
        
        if catering_vendor:
            vendors.append(Vendor.objects.create(
                wedding=bride_wedding,
                vendor_catalog=catering_vendor,
                status=vendor_status,
                cost_estimate=5000.00,
                actual_cost=5200.00
            ))
        
        if florist_vendor:
            vendors.append(Vendor.objects.create(
                wedding=bride_wedding,
                vendor_catalog=florist_vendor,
                status=vendor_status,
                cost_estimate=1500.00,
                actual_cost=1600.00
            ))
        
        # Create timeline
        from timeline.models import Timeline, TimelineEvent, TimelineStatus
        timeline_status = TimelineStatus.objects.get(name='pending')
        
        timeline = Timeline.objects.create(
            wedding=bride_wedding,
            name='Sarah & Michael Wedding Timeline'
        )
        
        # Create timeline events
        events = [
            ('Venue Booking', date(2024, 1, 15), '09:00', '10:00'),
            ('Dress Fitting', date(2024, 2, 20), '14:00', '15:00'),
            ('Cake Tasting', date(2024, 3, 10), '11:00', '13:00'),
            ('Final Guest Count', date(2024, 5, 1), '16:00', '17:00'),
            ('Rehearsal Dinner', date(2024, 6, 14), '18:00', '21:00'),
            ('Wedding Day!', date(2024, 6, 15), '16:00', '23:59')
        ]
        
        for title, event_date, start_time, end_time in events:
            TimelineEvent.objects.create(
                timeline=timeline,
                title=title,
                event_date=event_date,
                start_time=start_time,
                end_time=end_time,
                status=timeline_status
            )
        
        # Create budget categories and expenses
        from expenses.models import BudgetCategory, Expense, ExpenseStatus
        expense_status = ExpenseStatus.objects.get(name='pending')
        
        budget_categories = []
        category_data = [
            ('Venue', 5000.00),
            ('Catering', 8000.00),
            ('Photography', 3000.00),
            ('Florist', 2000.00),
            ('Music', 1500.00)
        ]
        
        for name, amount in category_data:
            budget_categories.append(BudgetCategory.objects.create(
                wedding=bride_wedding,
                name=name,
                allocated_amount=amount
            ))
        
        # Create expenses
        expenses = []
        expense_data = [
            ('Venue Deposit', 1, 2500.00, 2500.00, date(2024, 1, 15)),
            ('Photography Package', 1, 3000.00, 2800.00, date(2024, 2, 1)),
            ('Floral Arrangements', 4, 2000.00, 1600.00, date(2024, 3, 15)),
            ('Catering Final Payment', 2, 5000.00, 5200.00, date(2024, 5, 15))
        ]
        
        for title, cat_idx, amount, paid, expense_date in expense_data:
            expenses.append(Expense.objects.create(
                wedding=bride_wedding,
                budget_category=budget_categories[cat_idx],
                vendor=vendors[0] if cat_idx < len(vendors) else None,
                status=expense_status,
                title=title,
                amount=amount,
                paid_amount=paid,
                expense_date=expense_date
            ))
        
        return Response({
            'message': 'Default accounts created successfully',
            'accounts': [
                {
                    'username': 'bride_demo',
                    'email': 'bride@weddingdemo.com',
                    'password': 'Demo123!@#',
                    'role': 'bride',
                    'wedding_id': bride_wedding.id,
                    'guests_count': len(guests),
                    'vendors_count': len(vendors),
                    'expenses_count': len(expenses),
                    'timeline_events_count': len(events)
                },
                {
                    'username': 'groom_demo',
                    'email': 'groom@weddingdemo.com',
                    'password': 'Demo123!@#',
                    'role': 'groom',
                    'wedding_id': None
                }
            ]
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to create default accounts: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
