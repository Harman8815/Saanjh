from django.contrib import admin
from .models import (
    VendorCategory, VendorStatus, VendorCatalog, Vendor,
    VendorQuote, VendorContract, VendorMilestone, VendorCommunication
)

@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(VendorStatus)
class VendorStatusAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(VendorCatalog)
class VendorCatalogAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'contact', 'price_range', 'rating')
    list_filter = ('category', 'price_range')
    search_fields = ('name', 'contact')

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('id', 'wedding', 'vendor_catalog', 'status', 'cost_estimate', 'actual_cost', 'follow_up_date')
    list_filter = ('status', 'wedding')
    search_fields = ('vendor_catalog__name',)

@admin.register(VendorQuote)
class VendorQuoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'title', 'amount', 'status', 'valid_until')
    list_filter = ('status',)
    search_fields = ('title', 'vendor__vendor_catalog__name')

@admin.register(VendorContract)
class VendorContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'signed_date', 'expiry_date', 'deposit_amount', 'deposit_paid')
    list_filter = ('deposit_paid',)
    search_fields = ('vendor__vendor_catalog__name',)

@admin.register(VendorMilestone)
class VendorMilestoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'name', 'amount', 'due_date', 'paid')
    list_filter = ('paid',)
    search_fields = ('name', 'vendor__vendor_catalog__name')

@admin.register(VendorCommunication)
class VendorCommunicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'type', 'direction', 'subject', 'occurred_at', 'follow_up_date')
    list_filter = ('type', 'direction')
    search_fields = ('subject', 'body', 'vendor__vendor_catalog__name')

