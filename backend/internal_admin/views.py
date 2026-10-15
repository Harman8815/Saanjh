from django.shortcuts import render
from django.apps import apps


def home(request):
    """Home page for the wedding backend"""
    return render(request, 'internal_admin/home.html')


def api_docs(request):
    """Custom API documentation page with enhanced UI"""
    return render(request, 'internal_admin/api_docs.html')


def table_schemas_data(request):
    """API endpoint to get table schemas data"""
    from django.db import models
    
    schema_data = {}
    
    # Get all installed apps
    for app_config in apps.get_app_configs():
        app_name = app_config.name
        
        # Skip Django internal apps
        if app_name.startswith('django.') or app_name in ['rest_framework', 'rest_framework.authtoken', 'corsheaders', 'drf_spectacular']:
            continue
        
        # Get all models in the app
        app_models = []
        for model in app_config.get_models():
            model_info = {
                'name': model.__name__,
                'table_name': model._meta.db_table,
                'fields': []
            }
            
            # Get all fields
            for field in model._meta.get_fields():
                field_info = {
                    'name': field.name,
                    'type': field.__class__.__name__,
                    'relation': None,
                    'is_primary_key': False,
                    'is_foreign_key': False,
                    'is_required': False
                }
                
                # Check for primary key
                if hasattr(field, 'primary_key') and field.primary_key:
                    field_info['is_primary_key'] = True
                
                # Check for foreign key or many-to-many relations
                if isinstance(field, models.ForeignKey):
                    field_info['relation'] = f'FK → {field.related_model.__name__}'
                    field_info['is_foreign_key'] = True
                elif isinstance(field, models.ManyToManyField):
                    field_info['relation'] = f'M2M → {field.related_model.__name__}'
                    field_info['is_foreign_key'] = True
                elif isinstance(field, models.OneToOneField):
                    field_info['relation'] = f'1:1 → {field.related_model.__name__}'
                    field_info['is_foreign_key'] = True
                
                # Check if field is required (not blank and not null)
                if hasattr(field, 'blank') and hasattr(field, 'null'):
                    if not field.blank and not field.null:
                        field_info['is_required'] = True
                
                model_info['fields'].append(field_info)
            
            app_models.append(model_info)
        
        if app_models:
            schema_data[app_name] = app_models
    
    return schema_data
