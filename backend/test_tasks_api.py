#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wedding_backend.settings')
django.setup()

from accounts.models import User
from weddings.models import Wedding
from tasks.models import Task, TaskStatus, TaskPriority, TaskCategory

def test_tasks_api():
    print("Testing Tasks API...")
    
    # Check if initial data exists
    statuses = TaskStatus.objects.all()
    priorities = TaskPriority.objects.all()
    categories = TaskCategory.objects.all()
    
    print(f"Task Statuses: {statuses.count()}")
    for status in statuses:
        print(f"  - {status.name} ({status.color})")
    
    print(f"Task Priorities: {priorities.count()}")
    for priority in priorities:
        print(f"  - {priority.name} ({priority.color})")
    
    print(f"Task Categories: {categories.count()}")
    for category in categories:
        print(f"  - {category.name} ({category.color})")
    
    # Create a test user and wedding if they don't exist
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
        print("Created test user")
    
    try:
        wedding = Wedding.objects.get(user=user)
    except Wedding.DoesNotExist:
        wedding = Wedding.objects.create(user=user)
        print("Created test wedding")
    
    # Create a sample task
    todo_status = TaskStatus.objects.get(name='To Do')
    medium_priority = TaskPriority.objects.get(name='Medium')
    venue_category = TaskCategory.objects.get(name='Venue')
    
    task = Task.objects.create(
        wedding=wedding,
        title='Book wedding venue',
        description='Research and book the perfect wedding venue for our special day',
        status=todo_status,
        priority=medium_priority,
        category=venue_category,
        progress=25,
        created_by=user
    )
    
    print(f"Created sample task: {task.title}")
    print(f"  - Status: {task.status.name}")
    print(f"  - Priority: {task.priority.name}")
    print(f"  - Category: {task.category.name if task.category else 'None'}")
    print(f"  - Progress: {task.progress}%")
    print(f"  - Is Overdue: {task.is_overdue()}")
    print(f"  - Can Start: {task.can_start()}")
    
    # Test task statistics
    total_tasks = Task.objects.filter(wedding=wedding).count()
    print(f"\nTotal tasks for wedding: {total_tasks}")
    
    print("\nTasks API test completed successfully!")

if __name__ == '__main__':
    test_tasks_api()
