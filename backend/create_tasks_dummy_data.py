#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wedding_backend.settings')
django.setup()

from accounts.models import User
from weddings.models import Wedding
from tasks.models import Task, TaskStatus, TaskPriority, TaskCategory
from documents.models import DocumentTag

def create_comprehensive_dummy_data():
    """Create comprehensive dummy data for tasks testing"""
    
    print("Creating comprehensive dummy data for tasks...")
    
    # Get or create test user
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='John',
            last_name='Doe',
            password='testpass123'
        )
        print("Created test user")
    
    # Get or create wedding
    try:
        wedding = Wedding.objects.get(user=user)
    except Wedding.DoesNotExist:
        wedding = Wedding.objects.create(user=user)
        print("Created test wedding")
    
    # Get task statuses, priorities, and categories
    todo_status = TaskStatus.objects.get(name='To Do')
    in_progress_status = TaskStatus.objects.get(name='In Progress')
    review_status = TaskStatus.objects.get(name='Review')
    completed_status = TaskStatus.objects.get(name='Completed')
    
    low_priority = TaskPriority.objects.get(name='Low')
    medium_priority = TaskPriority.objects.get(name='Medium')
    high_priority = TaskPriority.objects.get(name='High')
    urgent_priority = TaskPriority.objects.get(name='Urgent')
    
    venue_category = TaskCategory.objects.get(name='Venue')
    catering_category = TaskCategory.objects.get(name='Catering')
    photography_category = TaskCategory.objects.get(name='Photography')
    decoration_category = TaskCategory.objects.get(name='Decoration')
    music_category = TaskCategory.objects.get(name='Music')
    guests_category = TaskCategory.objects.get(name='Guests')
    documentation_category = TaskCategory.objects.get(name='Documentation')
    transportation_category = TaskCategory.objects.get(name='Transportation')
    attire_category = TaskCategory.objects.get(name='Attire')
    gifts_category = TaskCategory.objects.get(name='Gifts')
    
    # Create some tags
    tags_data = [
        'urgent', 'budget', 'research', 'booking', 'payment', 
        'vendor', 'family', 'friends', 'outdoor', 'indoor',
        'traditional', 'modern', 'summer', 'spring'
    ]
    
    tags = []
    for tag_name in tags_data:
        tag, created = DocumentTag.objects.get_or_create(name=tag_name)
        tags.append(tag)
    
    print(f"Created/verified {len(tags)} tags")
    
    # Sample task data
    tasks_data = [
        # Venue related tasks
        {
            'title': 'Research wedding venues',
            'description': 'Visit and compare at least 5 different venues for the wedding',
            'status': completed_status,
            'priority': high_priority,
            'category': venue_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=30),
            'tags': ['research', 'venue']
        },
        {
            'title': 'Book wedding venue',
            'description': 'Finalize venue booking and pay deposit',
            'status': completed_status,
            'priority': urgent_priority,
            'category': venue_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=25),
            'tags': ['booking', 'venue', 'payment']
        },
        {
            'title': 'Venue decoration planning',
            'description': 'Plan the layout and decoration for the ceremony and reception areas',
            'status': in_progress_status,
            'priority': medium_priority,
            'category': decoration_category,
            'progress': 60,
            'due_date': datetime.now() + timedelta(days=15),
            'tags': ['decoration', 'planning']
        },
        
        # Catering tasks
        {
            'title': 'Research catering options',
            'description': 'Get quotes from at least 3 different catering companies',
            'status': in_progress_status,
            'priority': high_priority,
            'category': catering_category,
            'progress': 40,
            'due_date': datetime.now() + timedelta(days=10),
            'tags': ['research', 'catering', 'budget']
        },
        {
            'title': 'Finalize menu selection',
            'description': 'Choose appetizers, main courses, desserts, and drinks',
            'status': todo_status,
            'priority': medium_priority,
            'category': catering_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=20),
            'tags': ['catering', 'menu']
        },
        
        # Photography tasks
        {
            'title': 'Book wedding photographer',
            'description': 'Research and book a professional wedding photographer',
            'status': completed_status,
            'priority': high_priority,
            'category': photography_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=20),
            'tags': ['booking', 'photography', 'vendor']
        },
        {
            'title': 'Plan photo shoot locations',
            'description': 'Identify best spots for wedding photos at the venue',
            'status': todo_status,
            'priority': low_priority,
            'category': photography_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=30),
            'tags': ['photography', 'planning']
        },
        
        # Music tasks
        {
            'title': 'Hire wedding band/DJ',
            'description': 'Research and book entertainment for the reception',
            'status': in_progress_status,
            'priority': medium_priority,
            'category': music_category,
            'progress': 30,
            'due_date': datetime.now() + timedelta(days=25),
            'tags': ['music', 'booking', 'vendor']
        },
        {
            'title': 'Create wedding playlist',
            'description': 'Prepare list of favorite songs for the DJ/band',
            'status': todo_status,
            'priority': low_priority,
            'category': music_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=35),
            'tags': ['music', 'planning']
        },
        
        # Guest management tasks
        {
            'title': 'Finalize guest list',
            'description': 'Complete the guest list with addresses and contact information',
            'status': completed_status,
            'priority': high_priority,
            'category': guests_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=15),
            'tags': ['guests', 'planning']
        },
        {
            'title': 'Send wedding invitations',
            'description': 'Design, print, and send wedding invitations to all guests',
            'status': in_progress_status,
            'priority': high_priority,
            'category': guests_category,
            'progress': 70,
            'due_date': datetime.now() + timedelta(days=5),
            'tags': ['guests', 'urgent', 'family']
        },
        {
            'title': 'Track RSVP responses',
            'description': 'Monitor and track all RSVP responses from guests',
            'status': todo_status,
            'priority': medium_priority,
            'category': guests_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=12),
            'tags': ['guests', 'tracking']
        },
        
        # Documentation tasks
        {
            'title': 'Apply for marriage license',
            'description': 'Complete and submit marriage license application',
            'status': completed_status,
            'priority': urgent_priority,
            'category': documentation_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=40),
            'tags': ['documentation', 'urgent']
        },
        {
            'title': 'Organize vendor contracts',
            'description': 'File and organize all vendor contracts and receipts',
            'status': in_progress_status,
            'priority': medium_priority,
            'category': documentation_category,
            'progress': 50,
            'due_date': datetime.now() + timedelta(days=8),
            'tags': ['documentation', 'vendor']
        },
        
        # Transportation tasks
        {
            'title': 'Book wedding day transportation',
            'description': 'Arrange transportation for wedding party and guests',
            'status': todo_status,
            'priority': medium_priority,
            'category': transportation_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=18),
            'tags': ['transportation', 'booking']
        },
        
        # Attire tasks
        {
            'title': 'Select wedding dress',
            'description': 'Choose and order the perfect wedding dress',
            'status': completed_status,
            'priority': high_priority,
            'category': attire_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=35),
            'tags': ['attire', 'urgent']
        },
        {
            'title': 'Get groom suit fitted',
            'description': 'Select and get fitted for groom and groomsmen suits',
            'status': in_progress_status,
            'priority': medium_priority,
            'category': attire_category,
            'progress': 80,
            'due_date': datetime.now() + timedelta(days=7),
            'tags': ['attire']
        },
        
        # Gifts tasks
        {
            'title': 'Order wedding rings',
            'description': 'Select and order wedding bands',
            'status': completed_status,
            'priority': high_priority,
            'category': gifts_category,
            'progress': 100,
            'due_date': datetime.now() - timedelta(days=45),
            'tags': ['gifts', 'urgent']
        },
        {
            'title': 'Prepare wedding favors',
            'description': 'Choose and prepare wedding favors for guests',
            'status': todo_status,
            'priority': low_priority,
            'category': gifts_category,
            'progress': 0,
            'due_date': datetime.now() + timedelta(days=22),
            'tags': ['gifts', 'guests']
        }
    ]
    
    # Create tasks
    created_tasks = []
    for task_data in tasks_data:
        # Extract tags
        tag_names = task_data.pop('tags', [])
        
        # Create task
        task = Task.objects.create(
            wedding=wedding,
            created_by=user,
            **task_data
        )
        
        # Add tags
        for tag_name in tag_names:
            try:
                tag = DocumentTag.objects.get(name=tag_name)
                task.tags.add(tag)
            except DocumentTag.DoesNotExist:
                # Create tag if it doesn't exist
                tag = DocumentTag.objects.create(name=tag_name)
                task.tags.add(tag)
        
        created_tasks.append(task)
    
    print(f"Created {len(created_tasks)} tasks")
    
    # Create some overdue tasks
    overdue_tasks_data = [
        {
            'title': 'Pay venue deposit',
            'description': 'Pay the remaining balance for venue booking',
            'status': todo_status,
            'priority': urgent_priority,
            'category': venue_category,
            'progress': 50,
            'due_date': datetime.now() - timedelta(days=5),  # Overdue
            'tags': ['payment', 'urgent', 'venue']
        },
        {
            'title': 'Confirm catering final count',
            'description': 'Provide final guest count to catering service',
            'status': todo_status,
            'priority': high_priority,
            'category': catering_category,
            'progress': 0,
            'due_date': datetime.now() - timedelta(days=2),  # Overdue
            'tags': ['catering', 'urgent', 'guests']
        }
    ]
    
    for task_data in overdue_tasks_data:
        tag_names = task_data.pop('tags', [])
        task = Task.objects.create(
            wedding=wedding,
            created_by=user,
            **task_data
        )
        
        for tag_name in tag_names:
            try:
                tag = DocumentTag.objects.get(name=tag_name)
                task.tags.add(tag)
            except DocumentTag.DoesNotExist:
                tag = DocumentTag.objects.create(name=tag_name)
                task.tags.add(tag)
    
    print(f"Created {len(overdue_tasks_data)} overdue tasks")
    
    # Display statistics
    total_tasks = Task.objects.filter(wedding=wedding).count()
    overdue_tasks = Task.objects.filter(wedding=wedding, due_date__lt=datetime.now()).exclude(status=completed_status).count()
    completed_tasks = Task.objects.filter(wedding=wedding, status=completed_status).count()
    
    print(f"\nTask Statistics:")
    print(f"  Total tasks: {total_tasks}")
    print(f"  Completed tasks: {completed_tasks}")
    print(f"  Overdue tasks: {overdue_tasks}")
    print(f"  In progress tasks: {total_tasks - completed_tasks}")
    
    # Test API endpoints (without authentication for now)
    print(f"\nDummy data creation completed successfully!")
    print("The frontend dropdowns should now populate with the following data:")
    print(f"  - Task Statuses: {TaskStatus.objects.count()} items")
    print(f"  - Task Priorities: {TaskPriority.objects.count()} items")
    print(f"  - Task Categories: {TaskCategory.objects.count()} items")
    print(f"  - Sample Tasks: {total_tasks} items")

if __name__ == '__main__':
    create_comprehensive_dummy_data()
