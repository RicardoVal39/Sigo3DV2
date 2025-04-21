from django.contrib import admin

from universidad.models import Room


from .models import *

class NodeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'latitude', 'longitude', 'altitude', 'category_node']
    search_fields = ['name', ]
    list_filter = ['category_node']
    list_editable= ['name', 'category_node']
    fieldsets = (
        (None, {
            'fields': ('name', 'category_node')}),
        ('Ubicación', {
            'fields': ('latitude', 'longitude', 'altitude')
        }),
    )
    readonly_fields = ['id']
    
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category_node":
            kwargs["queryset"] = Category.objects.all().order_by('context','name')    
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'context']
    search_fields = ['name']
    list_filter = ['name']
    
class EdgeAdmin(admin.ModelAdmin):
    list_display = ['pk','start_node', 'end_node', 'distance']
    search_fields = ['start_node', 'end_node']

class RoomStackedInline(admin.StackedInline):
    model = Room
    extra = 0
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "type_room":
            kwargs["queryset"] = Category.objects.filter(context="salones") 

        if db_field.name == "location":
            kwargs["queryset"] = Node.objects.all().order_by('category_node','name')  # Filtrar por contexto "nodo"      
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class CzmlObjectAdmin(admin.ModelAdmin):
    list_display = ['id_object','name', 'name_presentation', 'category_object','is_activated', 'description']
    search_fields = ['name']
    list_filter = ['is_activated']
    list_editable = ['name_presentation', 'is_activated']
    list_per_page = 10
    fieldsets = (
        (None, {
            'fields': ('id_object', 'name', 'name_presentation', 'category_object', 'is_activated', 'description')
        }),
        ('Ubicación y orientación', {
            'fields': ('location', 'heading', 'pitch', 'roll')
        }),
        ('Escala y visualización', {
            'fields': ('scale', 'image_object')
        }),
    )
    inlines = [RoomStackedInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category_object":
            kwargs["queryset"] = Category.objects.filter(context="objetos_czml").order_by('name')  # Filtrar por contexto "nodo"
        if db_field.name == "location":
            kwargs["queryset"] = Node.objects.filter(category_node__context="objetos_czml").order_by('category_node','name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


    def activate_czml_object(self, request, queryset):
        """Activar el objeto seleccionado y desactivar los demás."""
        # Desactivar todos los objetos activados
        CzmlObject.objects.filter(is_activated=True).update(is_activated=False)
        
        # Activar los objetos seleccionados
        queryset.update(is_activated=True)

        self.message_user(request, "Los objetos han sido activados correctamente.")
    activate_czml_object.short_description = "Activar seleccionado y desactivar otros"
    
    actions = ['activate_czml_object']
    
class RouteAdmin(admin.ModelAdmin):
    list_display = ['id', 'start_node', 'end_node', 'total_distance']
    search_fields = ['start_node', 'end_node']
    list_filter = ['start_node', 'end_node']
    
admin.site.register(CzmlObject, CzmlObjectAdmin)
admin.site.register(Edge, EdgeAdmin)
admin.site.register(Node, NodeAdmin)
admin.site.register(Route, RouteAdmin)
admin.site.register(Category, CategoryAdmin)
