"""
Fake data generation utilities for the Wedding Proposal Generator.
This module provides functions to generate realistic sample data for testing.
"""

import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from weddings.models import Wedding
from guests.models import Guest
from vendors.models import Vendor
from expenses.models import Expense
from wedding_cards.models import WeddingCard, WeddingCardGuest, WeddingCardAnalytics
from timeline.models import Timeline, TimelineEvent

User = get_user_model()

# Sample data pools
FIRST_NAMES = [
    "James", "Emma", "Oliver", "Sophia", "William", "Ava", "Henry", "Isabella",
    "Lucas", "Mia", "Alexander", "Charlotte", "Michael", "Amelia", "Ethan", "Harper",
    "Daniel", "Evelyn", "Matthew", "Abigail", "Joseph", "Emily", "David", "Elizabeth",
    "Samuel", "Sofia", "Christopher", "Avery", "Joshua", "Ella", "Andrew", "Madison",
    "Benjamin", "Scarlett", "Jacob", "Victoria", "Nathan", "Grace", "Ryan", "Chloe"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson"
]

VENUE_NAMES = [
    "Grand Ballroom", "Sunset Gardens", "Crystal Palace", "Rosewood Manor", "Oceanview Resort",
    "Mountain Lodge", "City Hall", "Botanical Gardens", "Historic Mansion", "Beach Club",
    "Country Club", "Vineyard Estate", "Castle Venue", "Art Gallery", "Rooftop Garden",
    "Lakeside Pavilion", "Forest Retreat", "Urban Loft", "Heritage Hall", "Garden Terrace"
]

VENDOR_NAMES = {
    "venue": ["Grand Ballroom", "Sunset Gardens", "Crystal Palace", "Rosewood Manor", "Oceanview Resort"],
    "photography": ["Capture Moments", "Lens & Light", "Picture Perfect", "Memory Makers", "Shutter Dreams"],
    "catering": ["Gourmet Delights", "Taste of Heaven", "Culinary Arts", "Fine Dining", "Flavor Fusion"],
    "florist": ["Bloom & Blossom", "Petal Paradise", "Floral Fantasy", "Garden Grace", "Rose Romance"],
    "music": ["Melody Makers", "Harmony Heights", "Beat Masters", "Sound Wave", "Rhythm & Blues"],
    "cake": ["Sweet Creations", "Cake Dreams", "Sugar & Spice", "Dessert Heaven", "Frosting Fantasy"],
    "decorations": ["Elegant Events", "Design Dreams", "Party Perfect", "Creative Spaces", "Artistic Touch"],
    "transportation": ["Luxury Rides", "Happy Wheels", "Comfort Cars", "Elite Transport", "Smooth Journey"],
    "officiant": ["Ceremony Celebrations", "Unity Services", "Wedding Words", "Vow Masters", "Marriage Magic"]
}

EXPENSE_DESCRIPTIONS = {
    "venue": ["Venue rental fee", "Security deposit", "Cleaning service", "Insurance", "Setup fee"],
    "catering": ["Food and beverage", "Service staff", "Bar service", "Cake cutting fee", "Gratuity"],
    "photography": ["Photography package", "Videography service", "Photo album", "Extra hours", "Drone footage"],
    "florist": ["Bridal bouquet", "Centerpieces", "Boutonnieres", "Ceremony flowers", "Reception decor"],
    "music": ["DJ services", "Live band", "Sound equipment", "Lighting package", "Dance floor rental"],
    "attire": ["Wedding dress", "Bridesmaid dresses", "Groom suit", "Groomsmen attire", "Accessories"],
    "rings": ["Engagement ring", "Wedding bands", "Engraving", "Insurance", "Ring box"],
    "transportation": ["Limousine service", "Shuttle bus", "Valet parking", "Airport transfer", "Guest transport"]
}

def generate_random_name():
    """Generate a random full name."""
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_random_email(name):
    """Generate a random email based on name."""
    first, last = name.lower().split()
    domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"]
    username_formats = [
        f"{first}.{last}",
        f"{first}{last}",
        f"{first}_{last}",
        f"{first}.{last}{random.randint(1, 99)}",
        f"{first}{random.randint(1, 99)}"
    ]
    return f"{random.choice(username_formats)}@{random.choice(domains)}"

def generate_random_phone():
    """Generate a random US phone number."""
    area_codes = ["212", "646", "917", "718", "347", "929", "516", "631", "914", "845"]
    exchange = random.randint(200, 999)
    number = random.randint(1000, 9999)
    return f"+1{random.choice(area_codes)}{exchange}{number}"

def generate_random_address():
    """Generate a random address."""
    streets = ["Main St", "Oak Ave", "Elm St", "Maple Dr", "Pine Ln", "Cedar Rd", "Washington Blvd", "Park Ave"]
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"]
    states = ["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "GA"]
    return f"{random.randint(100, 9999)} {random.choice(streets)}, {random.choice(cities)}, {random.choice(states)} {random.randint(10000, 99999)}"

def generate_random_date(start_date, end_date):
    """Generate a random date between start_date and end_date."""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start_date + timedelta(days=random_days)

def generate_decimal(min_val, max_val, places=2):
    """Generate a random decimal within range."""
    return Decimal(str(round(random.uniform(min_val, max_val), places)))

def create_fake_user(username=None, email=None):
    """Create a fake user."""
    if not username:
        username = f"user_{random.randint(1000, 9999)}"
    if not email:
        name = generate_random_name()
        email = generate_random_email(name)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=generate_random_name().split()[0],
        last_name=generate_random_name().split()[1],
        phone=generate_random_phone(),
        password="password123"
    )
    return user

def create_fake_wedding(user):
    """Create a fake wedding for a user."""
    wedding_date = generate_random_date(
        timezone.now().date() + timedelta(days=15),
        timezone.now().date() + timedelta(days=45)
    )
    
    # Choose couple configuration
    couple_types = [
        ("bride_name", "groom_name"),
        ("bride_name", "partner_name"),
        ("groom_name", "partner_name")
    ]
    name1, name2 = random.choice(couple_types)
    
    wedding = Wedding.objects.create(
        user=user,
        **{name1: generate_random_name()},
        **{name2: generate_random_name()},
        wedding_date=wedding_date,
        venue=random.choice(VENUE_NAMES),
        venue_address=generate_random_address(),
        guest_count=random.randint(50, 300),
        budget=generate_decimal(10000, 100000),
        website_url=f"https://{generate_random_name().lower().replace(' ', '')}-wedding.com",
        status=random.choice(["planning", "confirmed"])
    )
    return wedding

def create_fake_guests(wedding, count=20):
    """Create fake guests for a wedding."""
    guests = []
    relationships = ["family", "friend", "colleague", "other"]
    rsvp_statuses = ["pending", "confirmed", "declined"]

    for _ in range(count):
        name = generate_random_name()
        guest = Guest.objects.create(
            wedding=wedding,
            name=name,
            email=generate_random_email(name),
            phone=generate_random_phone(),
            rsvp_status=random.choice(rsvp_statuses),
            rsvp_date=generate_random_date(
                wedding.wedding_date - timedelta(days=30),
                wedding.wedding_date - timedelta(days=7)
            ) if random.random() > 0.3 else None,
            plus_one=random.choice([True, False]),
            plus_one_name=generate_random_name() if random.random() > 0.7 else None,
            relationship=random.choice(relationships),
            address=generate_random_address(),
            dietary_restrictions=random.choice(["Vegetarian", "Vegan", "Gluten-free", "Nut allergies", "None", None, None]),
            notes=random.choice(["College friend", "Work colleague", "Family friend", "Childhood friend", None, None]),
            invitation_sent=random.choice([True, False]),
            invitation_sent_date=generate_random_date(
                wedding.wedding_date - timedelta(days=45),
                wedding.wedding_date - timedelta(days=30)
            ) if random.random() > 0.4 else None,
            reminder_sent=random.choice([True, False])
        )
        guests.append(guest)

    return guests

def create_fake_vendors(wedding, count=8):
    """Create fake vendors for a wedding."""
    vendors = []
    statuses = ["pending", "contacted", "confirmed", "completed"]
    vendor_types = list(VENDOR_NAMES.keys())

    for i in range(min(count, len(vendor_types))):
        vendor_type = vendor_types[i]
        vendor_name = random.choice(VENDOR_NAMES[vendor_type])

        vendor = Vendor.objects.create(
            wedding=wedding,
            name=vendor_name,
            vendor_type=vendor_type,
            status=random.choice(statuses),
            contact_person=generate_random_name(),
            email=generate_random_email(vendor_name.replace(' ', '')),
            phone=generate_random_phone(),
            website=f"https://{vendor_name.lower().replace(' ', '')}.com",
            address=generate_random_address(),
            cost=generate_decimal(500, 15000),
            deposit_paid=generate_decimal(100, 3000),
            booking_date=generate_random_date(
                wedding.wedding_date - timedelta(days=45),
                wedding.wedding_date - timedelta(days=30)
            ),
            contract_signed=random.choice([True, False]),
            contract_signed_date=generate_random_date(
                wedding.wedding_date - timedelta(days=30),
                wedding.wedding_date - timedelta(days=7)
            ) if random.random() > 0.5 else None,
            services_provided=random.choice([
                "Full service package", "Basic package", "Premium package", "Custom arrangement", "Standard service"
            ]),
            notes=random.choice(["Recommended by friend", "Great reviews online", "Professional service", None, None]),
            last_contact_date=timezone.now() - timedelta(days=random.randint(1, 30)),
            next_follow_up=timezone.now().date() + timedelta(days=random.randint(1, 14))
        )
        vendors.append(vendor)

    return vendors

def create_fake_expenses(wedding, vendors, count=15):
    """Create fake expenses for a wedding."""
    expenses = []
    categories = list(Expense.CATEGORIES)
    payment_statuses = ["pending", "partial", "paid", "overdue"]

    for i in range(count):
        category = random.choice(categories)
        description_options = EXPENSE_DESCRIPTIONS.get(category, [f"{category.title()} expense"])

        # Try to associate with a vendor of matching category if available
        vendor = None
        if vendors:
            matching_vendors = [v for v in vendors if v.vendor_type == category]
            if matching_vendors:
                vendor = random.choice(matching_vendors)

        estimated_cost = generate_decimal(100, 5000)
        actual_cost = generate_decimal(estimated_cost * 0.8, estimated_cost * 1.3)
        amount_paid = generate_decimal(0, actual_cost)

        if amount_paid >= actual_cost:
            payment_status = "paid"
        elif amount_paid > 0:
            payment_status = "partial"
        else:
            payment_status = random.choice(["pending", "overdue"])

        expense = Expense.objects.create(
            wedding=wedding,
            description=random.choice(description_options),
            category=category,
            estimated_cost=estimated_cost,
            actual_cost=actual_cost,
            amount_paid=amount_paid,
            payment_status=payment_status,
            vendor=vendor,
            expense_date=generate_random_date(
                wedding.wedding_date - timedelta(days=45),
                wedding.wedding_date
            ),
            due_date=generate_random_date(
                timezone.now().date(),
                wedding.wedding_date + timedelta(days=7)
            ),
            paid_date=generate_random_date(
                expense.expense_date,
                timezone.now().date()
            ) if payment_status == "paid" else None,
            notes=random.choice(["Initial deposit", "Final payment", "Partial payment", None, None]),
            receipt_url=f"https://receipts.example.com/{random.randint(1000, 9999)}.pdf" if random.random() > 0.6 else None
        )
        expenses.append(expense)

    return expenses

def create_fake_timeline_events(wedding, count=25):
    """Create fake timeline events for a wedding."""
    events = []
    event_types = ['meeting', 'payment', 'deadline', 'event', 'task', 'reminder']
    statuses = ['pending', 'completed', 'overdue', 'cancelled']
    priorities = ['low', 'medium', 'high']

    # Create timeline
    timeline = Timeline.objects.create(
        wedding=wedding,
        name=f"{wedding.get_couple_name() or 'Wedding'} Timeline"
    )

    # Event templates with realistic descriptions
    event_templates = [
        ("Initial Venue Visit", "meeting", "low", "Tour potential venues and discuss availability"),
        ("Venue Booking", "payment", "high", "Pay deposit to secure wedding venue"),
        ("Catering Tasting", "meeting", "medium", "Sample menu options with caterer"),
        ("Catering Contract", "payment", "high", "Sign catering contract and pay deposit"),
        ("Photography Meeting", "meeting", "medium", "Discuss photography package and style"),
        ("Photography Deposit", "payment", "high", "Pay photography deposit"),
        ("Florist Consultation", "meeting", "medium", "Discuss floral arrangements and centerpieces"),
        ("Florist Order", "payment", "high", "Place flower order and pay deposit"),
        ("Dress Fitting #1", "task", "high", "First dress fitting appointment"),
        ("Dress Fitting #2", "task", "high", "Second dress fitting and alterations"),
        ("Suit Fitting", "task", "high", "Groom and groomsmen suit fitting"),
        ("Cake Tasting", "meeting", "low", "Sample wedding cake flavors and designs"),
        ("Cake Order", "payment", "medium", "Finalize cake design and place order"),
        ("Music Selection", "task", "medium", "Finalize playlist and DJ/band requirements"),
        ("Music Booking", "payment", "high", "Book DJ or live band"),
        ("Invitation Design", "task", "medium", "Design and approve wedding invitations"),
        ("Invitation Printing", "payment", "medium", "Print wedding invitations"),
        ("Send Invitations", "deadline", "high", "Mail wedding invitations to guests"),
        ("RSVP Deadline", "deadline", "high", "Final date for guest RSVPs"),
        ("Final Guest Count", "task", "high", "Confirm final headcount with vendors"),
        ("Transportation Booking", "payment", "medium", "Book limo or shuttle service"),
        ("Accommodation Booking", "payment", "medium", "Book hotel rooms for out-of-town guests"),
        ("Final Vendor Meeting", "meeting", "high", "Final meeting with all vendors"),
        ("Rehearsal Dinner", "event", "medium", "Rehearsal dinner with wedding party"),
        ("Wedding Day Setup", "task", "high", "Setup venue and decorations"),
        ("Wedding Ceremony", "event", "high", "The big day! Wedding ceremony"),
        ("Wedding Reception", "event", "high", "Wedding reception and celebration"),
    ]

    # Select random events from templates
    selected_events = random.sample(event_templates, min(count, len(event_templates)))

    for title, event_type, priority, description in selected_events:
        # Calculate date based on event type and wedding date
        days_before_wedding = random.randint(1, 45)
        if event_type == 'event' and 'Wedding' in title:
            days_before_wedding = 0
        elif event_type == 'event':
            days_before_wedding = random.randint(0, 2)

        event_date = wedding.wedding_date - timedelta(days=days_before_wedding)

        # Determine status based on date
        if event_date < timezone.now().date():
            status = random.choice(['completed', 'overdue'])
        elif event_date == timezone.now().date():
            status = random.choice(['pending', 'completed'])
        else:
            status = random.choice(['pending', 'overdue'])

        # Generate time for events
        event_time = None
        if event_type in ['event', 'meeting']:
            hour = random.randint(9, 18)
            minute = random.choice([0, 15, 30, 45])
            event_time = f"{hour:02d}:{minute:02d}"

        timeline_event = TimelineEvent.objects.create(
            timeline=timeline,
            wedding=wedding,
            title=title,
            description=description,
            date=event_date,
            time=event_time,
            type=event_type,
            status_id=1,  # Default to pending status
            priority=priority,
            location=random.choice([
                wedding.venue or "TBD",
                "Venue",
                "Caterer's Office",
                "Florist Shop",
                "Photography Studio",
                "Bride's Home",
                "Groom's Home",
                "Hotel",
                "Restaurant"
            ]) if random.random() > 0.3 else None,
            notes=random.choice([
                "Bring checkbook",
                "Confirm details",
                "Review contract carefully",
                "Bring inspiration photos",
                "Measurements needed",
                None,
                None
            ])
        )
        events.append(timeline_event)

    return events

def create_fake_wedding_card(wedding):
    """Create a fake wedding card."""
    card = WeddingCard.objects.create(
        wedding=wedding,
        template=random.randint(1, 6),
        couple_names=wedding.get_couple_name() or "Happy Couple",
        wedding_details="Join us as we celebrate our love and begin our journey together. Your presence is the greatest gift we could ask for.",
        primary_color=random.choice(["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"]),
        font_style=random.choice(["elegant", "modern", "playful", "vintage", "minimal"]),
        photos=[f"https://picsum.photos/seed/wedding{random.randint(100, 999)}/800/600.jpg" for _ in range(random.randint(0, 3))],
        allow_guest_photos=random.choice([True, False]),
        require_rsvp=random.choice([True, False]),
        send_reminders=random.choice([True, False])
    )
    
    # Create analytics
    WeddingCardAnalytics.objects.create(
        wedding_card=card,
        total_views=random.randint(50, 500),
        unique_views=random.randint(30, 300),
        total_rsvps=random.randint(20, 100),
        confirmed_rsvps=random.randint(15, 80),
        declined_rsvps=random.randint(0, 20),
        total_photos_uploaded=random.randint(0, 50)
    )
    
    return card

def create_fake_wedding_card_guests(wedding_card, count=10):
    """Create fake wedding card guests."""
    guests = []
    rsvp_statuses = ["pending", "confirmed", "declined"]
    
    for _ in range(count):
        name = generate_random_name()
        guest = WeddingCardGuest.objects.create(
            wedding_card=wedding_card,
            name=name,
            email=generate_random_email(name),
            rsvp_status=random.choice(rsvp_statuses),
            plus_one=random.choice([True, False]),
            plus_one_name=generate_random_name() if random.random() > 0.7 else None,
            dietary_restrictions=random.choice(["Vegetarian", "None", "Gluten-free", None, None]),
            notes=random.choice(["Looking forward to it!", "Can't wait!", "So excited!", None, None]),
            uploaded_photos=[f"https://picsum.photos/seed/guest{random.randint(100, 999)}/400/300.jpg" for _ in range(random.randint(0, 2))] if wedding_card.allow_guest_photos and random.random() > 0.7 else []
        )
        guests.append(guest)
    
    return guests

def generate_complete_fake_dataset(user_count=3, guests_per_wedding=30, vendors_per_wedding=8, expenses_per_wedding=15, timeline_events_per_wedding=25):
    """Generate a complete fake dataset for testing."""
    results = {
        "users": [],
        "weddings": [],
        "guests": [],
        "vendors": [],
        "expenses": [],
        "wedding_cards": [],
        "timeline_events": []
    }

    for i in range(user_count):
        # Create user
        user = create_fake_user(f"testuser{i+1}", f"testuser{i+1}@example.com")
        results["users"].append(user)

        # Create wedding
        wedding = create_fake_wedding(user)
        results["weddings"].append(wedding)

        # Create guests
        guests = create_fake_guests(wedding, guests_per_wedding)
        results["guests"].extend(guests)

        # Create vendors
        vendors = create_fake_vendors(wedding, vendors_per_wedding)
        results["vendors"].extend(vendors)

        # Create expenses
        expenses = create_fake_expenses(wedding, vendors, expenses_per_wedding)
        results["expenses"].extend(expenses)

        # Create timeline events
        timeline_events = create_fake_timeline_events(wedding, timeline_events_per_wedding)
        results["timeline_events"].extend(timeline_events)

        # Create wedding card
        wedding_card = create_fake_wedding_card(wedding)
        results["wedding_cards"].append(wedding_card)

        # Create wedding card guests
        card_guests = create_fake_wedding_card_guests(wedding_card, 15)
        results["guests"].extend(card_guests)

    return results
