from django.db import models


class Category(models.Model):
    """
    Modelo para las categorias de los cualquier contexto.
    Las categorias representan los diferentes tipos de elementos usados en UnillanGO.

    Attributes:
        name (str): Nombre de la categoria.
        url_icon (str): Icono de la categoria.
        context (str): Contexto de la categoria.
    """
    context_choices = [("nodos", "Nodos"), ("objetos_czml", "Objetos_Czml"), ("salones", "Salones"), ("usuarios", "Usuarios"), ("horarios", "Horarios"), ("recursos", "Recursos")]
    name = models.CharField(max_length=255, verbose_name="Nombre de la categoria", default="Camino")  # Nombre de la categoria
    icon = models.ImageField(upload_to='icons_category/', verbose_name="Icono de la categoria", null=True, blank=True)  # Icono de la categoria
    context = models.CharField(max_length=255, verbose_name="Contexto", choices=context_choices, default="nodos")  # Contexto de la categoria
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        db_table = "category"

    def __str__(self):
        return f'{self.context} - {self.name}'

class CzmlObject(models.Model):
    """
    Modelo para los objetos 3D en CZML.
    Este modelo se utiliza para representar los objetos 3D que se encuentran en el archivo CZML.

    Attributes:
        id_object (str): Identificador único del objeto CZML.
        name (str): Nombre del objeto CZML.
        type_object (str): Tipo de objeto (por defecto: "Modelo").
        description (str): Descripción del objeto.
        is_activated (bool): Indica si el objeto está activado o no.
        location (Node): Ubicación del objeto en el mapa.
        heading (float): Rotación Y del objeto en grados.
        pitch (float): Rotación X del objeto en grados.
        roll (float): Rotación Z del objeto en grados.
        scale (float): Escala del objeto.
        image_object (str): Imagen del objeto CZML.
        category_object (Category): Categoría a la que pertenece el objeto CZML.
    """
    id_object = models.CharField(max_length=100, primary_key=True, default="0000")
    name = models.CharField(max_length=100, verbose_name="Nombre del objeto CZML")  # Nombre del objeto CZML
    name_presentation = models.CharField(max_length=100, verbose_name="Nombre de la presentacion", null=True, blank=True)  # Nombre de la presentacion
    type_object = models.CharField(max_length=100, verbose_name="Tipo de objeto", default="Modelo")  # Tipo de objeto
    description = models.TextField(verbose_name="Descripción del objeto", null=True, blank=True)  # Descripción del objeto
    is_activated = models.BooleanField(default=False, verbose_name="Activado")  # Indica si el objeto está activado
    location = models.ForeignKey('Node', related_name='location_czml', on_delete=models.CASCADE, verbose_name="Ubicacion", null=True, blank=True)  # Ubicacion del objeto
    heading =  models.FloatField(verbose_name="Rotación Y", default=0.0)
    pitch =  models.FloatField(verbose_name="Rotacion X", default=0.0)
    roll = models.FloatField(verbose_name="Rotacion Z", default=0.0)
    scale = models.FloatField(verbose_name="Escala", default=1)
    image_object = models.ImageField(upload_to='images_czml/', verbose_name="Imagen del objeto", null=True, blank=True)  # Imagen del objeto
    category_object = models.ForeignKey(Category, related_name='category_object', on_delete=models.CASCADE, verbose_name="Categoria del objeto", null=True, blank=True)  # Categoria del objeto
    class Meta:
        verbose_name = "Objeto CZML"
        verbose_name_plural = "Objetos CZML"
        db_table = "czml_objects"

    def __str__(self):
        return f"CzmlObject: {self.id_object} - {self.name}" # Return the name of the object
    
class Node(models.Model):
    """
    Modelo para los nodos (puntos) en el grafo y referencia a ubicaciones en el mapa.
    Los nodos representan puntos de interés o intersecciones en el mapa.
    Cada nodo tiene una ubicación geográfica (latitud, longitud, altitud).

    Attributes:
        name (str): Nombre del punto.
        category_node (str): Categoría de la ubicación relacionado a la universidad (Camino, Bienestar, Edificios, Infraestructura servicios, Entradas, Parqueadero, Cafeteria, Punto de encuentro y Bloques) (por defecto: Camino).
        latitude (float): Latitud del punto en coordenadas geográficas.
        longitude (float): Longitud del punto en coordenadas geográficas.
        altitude (float): Altitud del punto en metros sobre el nivel del mar.
    """
    name = models.CharField(max_length=255, verbose_name="Nombre del punto")  # Nombre del punto
    category_node = models.ForeignKey(Category, related_name='category_node', on_delete=models.CASCADE, verbose_name="Categoria", null=True, blank=True)  # Categoria del nodo 
    latitude = models.FloatField(verbose_name="Latitud")  # Latitud del punto
    longitude = models.FloatField(verbose_name="Longitud")  # Longitud del punto
    altitude = models.FloatField(verbose_name="Altitud", default=0)  # Altitud del punto (en metros)
    
    class Meta:
        verbose_name = "Nodo"
        verbose_name_plural = "Nodos"
        db_table = "nodes"

    def __str__(self):
        return f' {self.category_node} - {self.name}'

class Edge(models.Model):
    """
    Modelo para las aristas (caminos) entre nodos.
    Las aristas representan los caminos entre dos nodos, con una distancia asociada.

    Attributes:
        start_node (Node): Nodo inicial del camino.
        end_node (Node): Nodo final del camino.
        distance (float): Distancia entre los dos nodos en metros.
    """
    start_node = models.ForeignKey(Node, related_name='outgoing_edges', on_delete=models.CASCADE, verbose_name="Nodo inicial")  # Nodo inicial
    end_node = models.ForeignKey(Node, related_name='incoming_edges', on_delete=models.CASCADE, verbose_name="Nodo final")  # Nodo final
    distance = models.FloatField(verbose_name="Distancia")  # Distancia entre los nodos, calculada en base a sus coordenadas
 
    class Meta:
        verbose_name = "Arista"
        verbose_name_plural = "Aristas"
        db_table = "edges"
        

    def __str__(self):
        return f"Edge from {self.start_node} to {self.end_node} with distance {self.distance}"

class RouteNode(models.Model):
    route = models.ForeignKey('Route', on_delete=models.CASCADE,verbose_name="Ruta a la que pertenence")
    node = models.ForeignKey('Node', on_delete=models.CASCADE, verbose_name="Nodo de la ruta")
    order = models.PositiveIntegerField( verbose_name="Orden del nodo en la ruta")
    class Meta:
        verbose_name = "Nodo de la ruta"
        verbose_name_plural = "Nodos de la ruta"
        db_table = "route_nodes"
    def __str__(self):
        return f"{self.route.pk} - {self.order} - {self.node.name}" 
    
    
class Route(models.Model):
    """
    Modelo para las rutas generadas entre dos nodos.
    Este modelo almacena las rutas calculadas utilizando el algoritmo de Dijkstra, que incluye una referencia al objeto CZML asociado.

    Attributes:
        start_node (Node): Nodo de inicio de la ruta.
        end_node (Node): Nodo de destino de la ruta.
        path (ManyToManyField): Secuencia de nodos que forman la ruta.
        total_distance (float): Distancia total de la ruta en metros.
    """
    start_node = models.ForeignKey(Node, related_name='starting_routes', on_delete=models.CASCADE, verbose_name="Nodo de inicio")  # Nodo de inicio
    end_node = models.ForeignKey(Node, related_name='ending_routes', on_delete=models.CASCADE, verbose_name="Nodo de destino")  # Nodo de destino
    total_distance = models.FloatField(verbose_name="Distancia total")  # Distancia total de la ruta
    
    class Meta:
        verbose_name = "Ruta"
        verbose_name_plural = "Rutas"
        db_table = "routes"

    def __str__(self):
        return f"Route from {self.start_node.name} to {self.end_node.name}, distance {self.total_distance}"
