from django.contrib import admin
from .models import User, Email

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id","sender", "subject", "read", "archived")
admin.site.register(User)
admin.site.register(Email, EmailAdmin)
