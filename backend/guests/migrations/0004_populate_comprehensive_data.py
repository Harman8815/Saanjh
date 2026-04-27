# Generated comprehensive data population for guests app

from django.db import migrations
from django.conf import settings


def populate_comprehensive_data(apps, schema_editor):
    """Create comprehensive RSVP statuses, meals, tables, and sample guests"""
    RsvpStatus = apps.get_model('guests', 'RsvpStatus')
    Meal = apps.get_model('guests', 'Meal')
    Table = apps.get_model('guests', 'Table')
    Guest = apps.get_model('guests', 'Guest')
    Wedding = apps.get_model('weddings', 'Wedding')
    GuestMeal = apps.get_model('guests', 'GuestMeal')
    
    # Get or create a default wedding
    wedding, created = Wedding.objects.get_or_create(
        couple_name__contains="Sample",
        defaults={
            'couple_name': 'Sample Wedding',
            'wedding_date': '2024-06-15',
            'venue': 'Sample Venue',
            'budget': 50000.00,
            'guest_count': 100,
            'status_id': 1  # Assuming status 1 exists
        }
    )
    
    # Clear existing data to avoid duplicates
    RsvpStatus.objects.all().delete()
    Meal.objects.all().delete()
    Table.objects.all().delete()
    GuestMeal.objects.all().delete()
    Guest.objects.all().delete()
    
    # Create comprehensive RSVP statuses
    rsvp_statuses = [
        ('pending', 'Waiting for response'),
        ('confirmed', 'Guest confirmed attendance'),
        ('declined', 'Guest declined invitation'),
        ('tentative', 'Guest tentatively confirmed'),
    ]
    
    for status_name, description in rsvp_statuses:
        RsvpStatus.objects.get_or_create(name=status_name)
    
    # Create comprehensive meal options
    meals = [
        ('Standard', 'No special dietary requirements'),
        ('Vegetarian', 'No meat products'),
        ('Vegan', 'No animal products'),
        ('Gluten-Free', 'No gluten-containing foods'),
        ('Pescatarian', 'Vegetarian + fish'),
        ('Halal', 'Islamic dietary laws'),
        ('Kosher', 'Jewish dietary laws'),
        ('Nut-Free', 'Severe nut allergy'),
        ('Dairy-Free', 'No dairy products'),
        ('Low-Sodium', 'Reduced salt content'),
        ('Diabetic', 'Sugar-conscious meal'),
        ('Kids Meal', 'Child-friendly portion'),
    ]
    
    created_meals = {}
    for meal_name, description in meals:
        meal, created = Meal.objects.get_or_create(name=meal_name)
        created_meals[meal_name] = meal
    
    # Create sample tables
    tables_data = [
        (1, 8, 'VIP'),
        (2, 8, 'Family'),
        (3, 10, 'Friends'),
        (4, 8, 'Colleagues'),
        (5, 6, 'Elderly'),
        (6, 12, 'Young Adults'),
        (7, 8, 'Extended Family'),
        (8, 10, 'College Friends'),
    ]
    
    for table_number, capacity, table_type in tables_data:
        Table.objects.get_or_create(
            wedding=wedding,
            table_number=table_number,
            defaults={'capacity': capacity}
        )
    
    # Get status objects
    pending_status = RsvpStatus.objects.get(name='pending')
    confirmed_status = RsvpStatus.objects.get(name='confirmed')
    declined_status = RsvpStatus.objects.get(name='declined')
    
    # Create sample guests with diverse dietary requirements
    guests_data = [
        # Confirmed guests with various meal preferences
        ('Emily', 'Johnson', 'emily@email.com', '+1-555-0123', 'family', confirmed_status, 1, ['Vegetarian']),
        ('Sarah', 'Brown', 'sarah@email.com', '+1-555-0654', 'family', confirmed_status, 1, []),
        ('Jessica', 'Davis', 'jessica@email.com', '+1-555-0789', 'family', confirmed_status, 1, ['Gluten-Free']),
        ('Amanda', 'Taylor', 'amanda@email.com', '+1-555-0111', 'family', confirmed_status, 1, ['Kosher']),
        ('Michael', 'Smith', 'michael@email.com', '+1-555-0456', 'family', confirmed_status, 2, []),
        ('David', 'Lee', 'david@email.com', '+1-555-0987', 'friend', confirmed_status, 2, ['Halal']),
        ('Robert', 'Wilson', 'robert@email.com', '+1-555-0321', 'friend', confirmed_status, None, ['Vegan']),
        ('Christopher', 'Martinez', 'chris@email.com', '+1-555-0222', 'friend', confirmed_status, None, ['Pescatarian']),
        ('Daniel', 'Anderson', 'daniel@email.com', '+1-555-0333', 'friend', confirmed_status, 3, []),
        ('Matthew', 'Thompson', 'matthew@email.com', '+1-555-0444', 'friend', confirmed_status, 3, ['Nut-Free']),
        ('Jennifer', 'White', 'jennifer@email.com', '+1-555-0555', 'colleague', confirmed_status, 4, ['Dairy-Free']),
        ('Lisa', 'Harris', 'lisa@email.com', '+1-555-0666', 'colleague', confirmed_status, 4, []),
        ('Michelle', 'Clark', 'michelle@email.com', '+1-555-0777', 'colleague', confirmed_status, 4, ['Vegetarian']),
        ('Patricia', 'Lewis', 'patricia@email.com', '+1-555-0888', 'colleague', confirmed_status, 4, []),
        
        # Pending guests
        ('James', 'Walker', 'james@email.com', '+1-555-0999', 'family', pending_status, None, []),
        ('John', 'Hall', 'john@email.com', '+1-555-1111', 'friend', pending_status, None, []),
        ('Richard', 'Allen', 'richard@email.com', '+1-555-2222', 'colleague', pending_status, None, []),
        ('Charles', 'Young', 'charles@email.com', '+1-555-3333', 'family', pending_status, None, ['Standard']),
        
        # Declined guests
        ('Joseph', 'King', 'joseph@email.com', '+1-555-4444', 'friend', declined_status, None, []),
        ('Thomas', 'Wright', 'thomas@email.com', '+1-555-5555', 'colleague', declined_status, None, []),
        ('Mark', 'Scott', 'mark@email.com', '+1-555-6666', 'family', declined_status, None, []),
        
        # More confirmed guests for table 5
        ('Barbara', 'Green', 'barbara@email.com', '+1-555-7777', 'family', confirmed_status, 5, ['Low-Sodium']),
        ('Nancy', 'Adams', 'nancy@email.com', '+1-555-8888', 'family', confirmed_status, 5, ['Diabetic']),
        ('Betty', 'Baker', 'betty@email.com', '+1-555-9999', 'friend', confirmed_status, 5, ['Kids Meal']),
        
        # More confirmed guests for table 6
        ('Helen', 'Nelson', 'helen@email.com', '+1-555-1212', 'friend', confirmed_status, 6, []),
        ('Sandra', 'Carter', 'sandra@email.com', '+1-555-1313', 'friend', confirmed_status, 6, ['Vegetarian']),
        ('Donna', 'Mitchell', 'donna@email.com', '+1-555-1414', 'friend', confirmed_status, 6, []),
        ('Carol', 'Perez', 'carol@email.com', '+1-555-1515', 'friend', confirmed_status, 6, ['Vegan']),
        ('Ruth', 'Roberts', 'ruth@email.com', '+1-555-1616', 'friend', confirmed_status, 6, []),
        ('Sharon', 'Turner', 'sharon@email.com', '+1-555-1717', 'friend', confirmed_status, 6, ['Gluten-Free']),
        ('Michelle', 'Phillips', 'michelle2@email.com', '+1-555-1818', 'friend', confirmed_status, 6, []),
        ('Laura', 'Campbell', 'laura@email.com', '+1-555-1919', 'friend', confirmed_status, 6, []),
        ('Sarah', 'Parker', 'sarah2@email.com', '+1-555-2020', 'friend', confirmed_status, 6, []),
        ('Kimberly', 'Evans', 'kimberly@email.com', '+1-555-2121', 'friend', confirmed_status, 6, []),
    ]
    
    # Create guests and assign meal preferences
    for first_name, last_name, email, phone, relationship, rsvp_status, table_id, meals in guests_data:
        guest = Guest.objects.create(
            wedding=wedding,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            relationship=relationship,
            rsvp_status=rsvp_status,
            table_id=table_id,
            invitation_sent=True,
            invitation_sent_date='2024-04-01T10:00:00Z',
        )
        
        # Assign meal preferences
        for meal_name in meals:
            meal = created_meals.get(meal_name)
            if meal:
                GuestMeal.objects.get_or_create(guest=guest, meal=meal)


class Migration(migrations.Migration):

    dependencies = [
        ('guests', '0003_populate_guests_data'),
        ('weddings', '0003_populate_wedding_core_data'),
    ]

    operations = [
        migrations.RunPython(populate_comprehensive_data),
    ]
