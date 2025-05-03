from django.contrib import admin
from .models import *

class InterfazAdmin(admin.ModelAdmin):
    list_display = ['pk', 'name','name_institution','is_activated']
    list_editable = ['name','name_institution','is_activated']

class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['id', 'category_schedule', 'start_time', 'end_time', 'day_of_week']
    search_fields = ['category_schedule']
    list_filter = ['day_of_week']
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category_schedule":
            kwargs["queryset"] = Category.objects.filter(context="horarios")  # Filtrar por contexto "nodo"
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'type_resource', 'reference']
    search_fields = ['name']
    list_filter = ['type_resource']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "type_resource":
            kwargs["queryset"] = Category.objects.filter(context="recursos")  # Filtrar por contexto "nodo"
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class RoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'image_room', 'object_father', 'type_room']
    search_fields = ['name']
    list_filter = ['object_father', 'type_room']
    list_editable = ['name', 'image_room', 'object_father', 'type_room']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "type_room":
            kwargs["queryset"] = Category.objects.filter(context="salones")  # Filtrar por contexto "nodo"
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class FacultyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'location']
    search_fields = ['name']
    
class CareerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'faculty']
    search_fields = ['name']
    list_filter = ['faculty']
    list_editable = ['faculty']

admin.site.register(Interfaz, InterfazAdmin)
admin.site.register(Schedule, ScheduleAdmin)
admin.site.register(Resource, ResourceAdmin)
admin.site.register(Room, RoomAdmin)
admin.site.register(Faculty, FacultyAdmin)
admin.site.register(Career, CareerAdmin)
admin.site.register(Course)
admin.site.register(Course_User)