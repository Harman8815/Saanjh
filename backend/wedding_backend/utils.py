"""
Utility functions for the Wedding Proposal Generator backend.
"""

import uuid
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .models import Wedding, Guest, Vendor, Expense


def generate_shareable_link():
    """Generate a unique shareable link for wedding cards."""
    return str(uuid.uuid4())[:8]


def calculate_wedding_statistics(wedding):
    """Calculate comprehensive wedding statistics."""
    
    # Guest statistics
    guests = wedding.guests.all()
    guest_stats = {
        'total': guests.count(),
        'confirmed': guests.filter(rsvp_status='confirmed').count(),
        'pending': guests.filter(rsvp_status='pending').count(),
        'declined': guests.filter(rsvp_status='declined').count(),
        'with_plus_one': guests.filter(plus_one=True).count(),
        'invitations_sent': guests.filter(invitation_sent=True).count(),
        'reminders_sent': guests.filter(reminder_sent=True).count(),
    }
    
    # RSVP rate
    if guest_stats['total'] > 0:
        guest_stats['rsvp_rate'] = round((guest_stats['confirmed'] / guest_stats['total']) * 100, 2)
    else:
        guest_stats['rsvp_rate'] = 0
    
    # Expected attendees (confirmed + plus ones)
    guest_stats['expected_attendees'] = guest_stats['confirmed'] + guests.filter(
        rsvp_status='confirmed', plus_one=True
    ).count()
    
    # Vendor statistics
    vendors = wedding.vendors.all()
    vendor_stats = {
        'total': vendors.count(),
        'pending': vendors.filter(status='pending').count(),
        'contacted': vendors.filter(status='contacted').count(),
        'confirmed': vendors.filter(status='confirmed').count(),
        'completed': vendors.filter(status='completed').count(),
        'cancelled': vendors.filter(status='cancelled').count(),
    }
    
    # Vendor type breakdown
    vendor_types = {}
    for vendor in vendors:
        vendor_type = vendor.get_vendor_type_display()
        vendor_types[vendor_type] = vendor_types.get(vendor_type, 0) + 1
    vendor_stats['by_type'] = vendor_types
    
    # Total vendor costs
    total_cost = sum(vendor.cost or 0 for vendor in vendors)
    total_deposits = sum(vendor.deposit_paid or 0 for vendor in vendors)
    vendor_stats['total_cost'] = total_cost
    vendor_stats['total_deposits'] = total_deposits
    vendor_stats['remaining_balance'] = total_cost - total_deposits
    
    # Expense statistics
    expenses = wedding.expenses.all()
    expense_stats = {
        'total_expenses': expenses.count(),
        'total_estimated': expenses.aggregate(total=Sum('estimated_cost'))['total'] or 0,
        'total_actual': expenses.aggregate(total=Sum('actual_cost'))['total'] or 0,
        'total_paid': expenses.aggregate(total=Sum('amount_paid'))['total'] or 0,
    }
    
    expense_stats['remaining_balance'] = expense_stats['total_actual'] - expense_stats['total_paid']
    
    # Budget comparison
    if wedding.budget:
        expense_stats['budget'] = wedding.budget
        expense_stats['budget_used'] = round((expense_stats['total_actual'] / wedding.budget) * 100, 2)
        expense_stats['budget_remaining'] = wedding.budget - expense_stats['total_actual']
    else:
        expense_stats['budget'] = 0
        expense_stats['budget_used'] = 0
        expense_stats['budget_remaining'] = 0
    
    # Payment status breakdown
    payment_stats = {}
    for expense in expenses:
        status = expense.get_payment_status_display()
        payment_stats[status] = payment_stats.get(status, 0) + 1
    expense_stats['by_payment_status'] = payment_stats
    
    # Category breakdown
    category_stats = {}
    for expense in expenses:
        category = expense.get_category_display()
        if category not in category_stats:
            category_stats[category] = {
                'count': 0,
                'estimated': 0,
                'actual': 0,
                'paid': 0
            }
        category_stats[category]['count'] += 1
        category_stats[category]['estimated'] += expense.estimated_cost
        category_stats[category]['actual'] += expense.actual_cost or 0
        category_stats[category]['paid'] += expense.amount_paid
    
    expense_stats['by_category'] = category_stats
    
    # Overdue expenses
    today = timezone.now().date()
    overdue_expenses = expenses.filter(
        due_date__lt=today,
        payment_status__in=['pending', 'partial']
    ).count()
    expense_stats['overdue_count'] = overdue_expenses
    
    return {
        'guest_stats': guest_stats,
        'vendor_stats': vendor_stats,
        'expense_stats': expense_stats,
        'days_until_wedding': wedding.days_until_wedding(),
    }


def get_upcoming_tasks(wedding):
    """Get upcoming tasks and reminders for the wedding."""
    today = timezone.now().date()
    tasks = []
    
    # Vendor follow-ups
    vendors_needing_followup = wedding.vendors.filter(
        next_follow_up__lte=today,
        status__in=['pending', 'contacted']
    )
    
    for vendor in vendors_needing_followup:
        tasks.append({
            'type': 'vendor_followup',
            'title': f'Follow up with {vendor.name}',
            'description': f'{vendor.get_vendor_type_display()} - {vendor.get_status_display()}',
            'due_date': vendor.next_follow_up,
            'priority': 'high' if vendor.next_follow_up < today else 'medium'
        })
    
    # Upcoming expense payments
    upcoming_expenses = wedding.expenses.filter(
        due_date__gte=today,
        due_date__lte=today + timezone.timedelta(days=30),
        payment_status__in=['pending', 'partial']
    )
    
    for expense in upcoming_expenses:
        tasks.append({
            'type': 'expense_payment',
            'title': f'Pay {expense.description}',
            'description': f'{expense.get_category_display()} - ${expense.remaining_balance()}',
            'due_date': expense.due_date,
            'priority': 'high' if expense.due_date <= today + timezone.timedelta(days=7) else 'medium'
        })
    
    # Guest reminders (if reminders enabled)
    guests_pending_rsvp = wedding.guests.filter(
        rsvp_status='pending',
        invitation_sent=True
    )
    
    if guests_pending_rsvp.exists():
        tasks.append({
            'type': 'guest_reminder',
            'title': 'Send RSVP reminders',
            'description': f'{guests_pending_rsvp.count()} guests haven\'t responded',
            'due_date': today + timezone.timedelta(days=7),
            'priority': 'low'
        })
    
    # Sort tasks by due date and priority
    priority_order = {'high': 1, 'medium': 2, 'low': 3}
    tasks.sort(key=lambda x: (x['due_date'], priority_order[x['priority']]))
    
    return tasks


def validate_email_domain(email, allowed_domains=None):
    """Validate email domain against allowed domains."""
    if not email or '@' not in email:
        return False
    
    domain = email.split('@')[1].lower()
    
    if allowed_domains:
        return domain in [d.lower() for d in allowed_domains]
    
    # Basic domain validation
    return '.' in domain and len(domain) > 2


def format_currency(amount, currency='USD'):
    """Format currency amount with proper formatting."""
    if amount is None:
        return '$0.00'
    
    return f'${amount:,.2f}'


def calculate_age(birth_date):
    """Calculate age from birth date."""
    if not birth_date:
        return None
    
    today = timezone.now().date()
    age = today.year - birth_date.year
    
    # Adjust age if birthday hasn't occurred this year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    
    return age


def generate_wedding_timeline(wedding):
    """Generate a comprehensive wedding timeline."""
    events = []
    
    # Add wedding creation
    events.append({
        'date': wedding.created_at,
        'event': 'Wedding Planning Started',
        'description': 'Your wedding planning journey begins!',
        'type': 'milestone',
        'icon': 'start'
    })
    
    # Add guest events
    for guest in wedding.guests.all():
        events.append({
            'date': guest.added_date,
            'event': f'Guest Added: {guest.name}',
            'description': f'{guest.name} was added to your guest list',
            'type': 'guest',
            'icon': 'person'
        })
        
        if guest.rsvp_date:
            events.append({
                'date': guest.rsvp_date,
                'event': f'RSVP Received: {guest.name}',
                'description': f'{guest.name} RSVPed: {guest.get_rsvp_status_display()}',
                'type': 'rsvp',
                'icon': 'check'
            })
    
    # Add vendor events
    for vendor in wedding.vendors.all():
        events.append({
            'date': vendor.created_at,
            'event': f'Vendor Added: {vendor.name}',
            'description': f'{vendor.name} ({vendor.get_vendor_type_display()}) added',
            'type': 'vendor',
            'icon': 'business'
        })
        
        if vendor.booking_date:
            events.append({
                'date': vendor.booking_date,
                'event': f'Vendor Booked: {vendor.name}',
                'description': f'{vendor.name} booking confirmed',
                'type': 'vendor',
                'icon': 'calendar'
            })
    
    # Add expense events
    for expense in wedding.expenses.all():
        events.append({
            'date': expense.created_at,
            'event': f'Expense Logged: {expense.description}',
            'description': f'{expense.get_category_display()}: ${expense.actual_cost or expense.estimated_cost}',
            'type': 'expense',
            'icon': 'payment'
        })
        
        if expense.paid_date:
            events.append({
                'date': expense.paid_date,
                'event': f'Payment Made: {expense.description}',
                'description': f'Payment of ${expense.amount_paid} completed',
                'type': 'expense',
                'icon': 'paid'
            })
    
    # Add wedding date if set
    if wedding.wedding_date:
        events.append({
            'date': wedding.wedding_date,
            'event': 'Wedding Day!',
            'description': f'The big day - {wedding.get_couple_name()}',
            'type': 'milestone',
            'icon': 'celebration'
        })
    
    # Sort events by date
    events.sort(key=lambda x: x['date'], reverse=True)
    
    return events


def export_data_to_dict(wedding):
    """Export all wedding data to a dictionary structure."""
    data = {
        'wedding': {
            'bride_name': wedding.bride_name,
            'groom_name': wedding.groom_name,
            'partner_name': wedding.partner_name,
            'wedding_date': wedding.wedding_date.isoformat() if wedding.wedding_date else None,
            'venue': wedding.venue,
            'venue_address': wedding.venue_address,
            'guest_count': wedding.guest_count,
            'budget': float(wedding.budget) if wedding.budget else None,
            'status': wedding.status,
        },
        'guests': [],
        'vendors': [],
        'expenses': [],
        'wedding_cards': [],
    }
    
    # Export guests
    for guest in wedding.guests.all():
        data['guests'].append({
            'name': guest.name,
            'email': guest.email,
            'phone': guest.phone,
            'rsvp_status': guest.rsvp_status,
            'rsvp_date': guest.rsvp_date.isoformat() if guest.rsvp_date else None,
            'plus_one': guest.plus_one,
            'plus_one_name': guest.plus_one_name,
            'relationship': guest.relationship,
            'address': guest.address,
            'dietary_restrictions': guest.dietary_restrictions,
            'notes': guest.notes,
            'added_date': guest.added_date.isoformat(),
        })
    
    # Export vendors
    for vendor in wedding.vendors.all():
        data['vendors'].append({
            'name': vendor.name,
            'vendor_type': vendor.vendor_type,
            'status': vendor.status,
            'contact_person': vendor.contact_person,
            'email': vendor.email,
            'phone': vendor.phone,
            'website': vendor.website,
            'address': vendor.address,
            'cost': float(vendor.cost) if vendor.cost else None,
            'deposit_paid': float(vendor.deposit_paid) if vendor.deposit_paid else None,
            'booking_date': vendor.booking_date.isoformat() if vendor.booking_date else None,
            'contract_signed': vendor.contract_signed,
            'services_provided': vendor.services_provided,
            'notes': vendor.notes,
        })
    
    # Export expenses
    for expense in wedding.expenses.all():
        data['expenses'].append({
            'description': expense.description,
            'category': expense.category,
            'estimated_cost': float(expense.estimated_cost),
            'actual_cost': float(expense.actual_cost) if expense.actual_cost else None,
            'amount_paid': float(expense.amount_paid),
            'payment_status': expense.payment_status,
            'expense_date': expense.expense_date.isoformat() if expense.expense_date else None,
            'due_date': expense.due_date.isoformat() if expense.due_date else None,
            'paid_date': expense.paid_date.isoformat() if expense.paid_date else None,
            'notes': expense.notes,
        })
    
    # Export wedding cards
    for card in wedding.wedding_cards.all():
        data['wedding_cards'].append({
            'template': card.template,
            'couple_names': card.couple_names,
            'wedding_details': card.wedding_details,
            'primary_color': card.primary_color,
            'font_style': card.font_style,
            'photos': card.photos,
            'allow_guest_photos': card.allow_guest_photos,
            'require_rsvp': card.require_rsvp,
            'send_reminders': card.send_reminders,
            'shareable_link': card.shareable_link,
        })
    
    return data
