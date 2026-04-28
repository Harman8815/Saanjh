from django.db import migrations


def create_initial_data(apps, schema_editor):
    """Create initial task statuses, priorities, and categories"""
    
    TaskStatus = apps.get_model('tasks', 'TaskStatus')
    TaskPriority = apps.get_model('tasks', 'TaskPriority')
    TaskCategory = apps.get_model('tasks', 'TaskCategory')
    
    # Create task statuses
    statuses = [
        {'name': 'To Do', 'color': '#6c757d', 'order': 1},
        {'name': 'In Progress', 'color': '#007bff', 'order': 2},
        {'name': 'Review', 'color': '#ffc107', 'order': 3},
        {'name': 'Completed', 'color': '#28a745', 'order': 4},
        {'name': 'Cancelled', 'color': '#dc3545', 'order': 5},
    ]
    
    for status_data in statuses:
        TaskStatus.objects.get_or_create(**status_data)
    
    # Create task priorities
    priorities = [
        {'name': 'Low', 'color': '#28a745', 'order': 1},
        {'name': 'Medium', 'color': '#ffc107', 'order': 2},
        {'name': 'High', 'color': '#fd7e14', 'order': 3},
        {'name': 'Urgent', 'color': '#dc3545', 'order': 4},
    ]
    
    for priority_data in priorities:
        TaskPriority.objects.get_or_create(**priority_data)
    
    # Create task categories
    categories = [
        {'name': 'Venue', 'description': 'Venue-related tasks', 'color': '#007bff'},
        {'name': 'Catering', 'description': 'Food and beverage tasks', 'color': '#28a745'},
        {'name': 'Photography', 'description': 'Photo and video tasks', 'color': '#6f42c1'},
        {'name': 'Decoration', 'description': 'Decoration and styling tasks', 'color': '#e83e8c'},
        {'name': 'Music', 'description': 'Music and entertainment tasks', 'color': '#fd7e14'},
        {'name': 'Guests', 'description': 'Guest management tasks', 'color': '#20c997'},
        {'name': 'Documentation', 'description': 'Legal and documentation tasks', 'color': '#6c757d'},
        {'name': 'Transportation', 'description': 'Transport and logistics tasks', 'color': '#17a2b8'},
        {'name': 'Attire', 'description': 'Clothing and accessories tasks', 'color': '#dc3545'},
        {'name': 'Gifts', 'description': 'Gift and favor tasks', 'color': '#f8f9fa'},
    ]
    
    for category_data in categories:
        TaskCategory.objects.get_or_create(**category_data)


def reverse_initial_data(apps, schema_editor):
    """Reverse the initial data creation"""
    
    TaskStatus = apps.get_model('tasks', 'TaskStatus')
    TaskPriority = apps.get_model('tasks', 'TaskPriority')
    TaskCategory = apps.get_model('tasks', 'TaskCategory')
    
    # Delete all initial data
    TaskStatus.objects.all().delete()
    TaskPriority.objects.all().delete()
    TaskCategory.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, reverse_initial_data),
    ]
