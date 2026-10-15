#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wedding_backend.settings')
django.setup()

from accounts.models import User

def create_sample_users():
    """Create sample users for task assignment"""
    
    print("Creating sample users for task assignment...")
    
    # Sample users data
    users_data = [
        {
            'username': 'sarah_johnson',
            'email': 'sarah.johnson@example.com',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'password': 'password123'
        },
        {
            'username': 'michael_johnson',
            'email': 'michael.johnson@example.com',
            'first_name': 'Michael',
            'last_name': 'Johnson',
            'password': 'password123'
        },
        {
            'username': 'emily_davis',
            'email': 'emily.davis@example.com',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'password': 'password123'
        },
        {
            'username': 'james_wilson',
            'email': 'james.wilson@example.com',
            'first_name': 'James',
            'last_name': 'Wilson',
            'password': 'password123'
        },
        {
            'username': 'olivia_martinez',
            'email': 'olivia.martinez@example.com',
            'first_name': 'Olivia',
            'last_name': 'Martinez',
            'password': 'password123'
        },
        {
            'username': 'robert_brown',
            'email': 'robert.brown@example.com',
            'first_name': 'Robert',
            'last_name': 'Brown',
            'password': 'password123'
        },
        {
            'username': 'jessica_taylor',
            'email': 'jessica.taylor@example.com',
            'first_name': 'Jessica',
            'last_name': 'Taylor',
            'password': 'password123'
        },
        {
            'username': 'david_anderson',
            'email': 'david.anderson@example.com',
            'first_name': 'David',
            'last_name': 'Anderson',
            'password': 'password123'
        }
    ]
    
    created_users = []
    for user_data in users_data:
        try:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                }
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                print(f"Created user: {user.first_name} {user.last_name} ({user.username})")
                created_users.append(user)
            else:
                print(f"User already exists: {user.first_name} {user.last_name} ({user.username})")
                created_users.append(user)
                
        except Exception as e:
            print(f"Error creating user {user_data['username']}: {e}")
    
    print(f"\nTotal users in system: {User.objects.count()}")
    print("\nAll users:")
    for user in User.objects.all().order_by('first_name', 'last_name'):
        print(f"  - {user.first_name} {user.last_name} ({user.username})")
    
    print(f"\nSample users creation completed!")
    print("The 'Assigned To' dropdown should now populate with {len(created_users)} users.")

if __name__ == '__main__':
    create_sample_users()
