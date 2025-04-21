from django.db import models
from django.contrib.auth.models import User
from colorfield.fields import ColorField
from czml.models import Category, CzmlObject, Node


class Interfaz(models.Model):
    """
    Modelo para la configuración dinamica de la interfaz.
    Este modelo almacena la información de la interfaz, incluyendo el nombre, color y tipo de interfaz.
    Attributes:
        name (CharField): Nombre de la interfaz.
        logo (ImageField): Logo de la interfaz.
        name_institution (CharField): Nombre de la institución.
        font_primary (CharField): Fuente primaria de la interfaz.
        font_secondary (CharField): Fuente secundaria de la interfaz.
        font_third (CharField): Fuente terciaria de la interfaz.
        primary_color (ColorField): Color primario de la interfaz.
        secondary_color (ColorField): Color secundario de la interfaz.
        third_color (ColorField): Color terciario de la interfaz.
        success_color (ColorField): Color de éxito de la interfaz.
        error_color (ColorField): Color de error de la interfaz.
        warning_color (ColorField): Color de advertencia de la interfaz.
        info_color (ColorField): Color de información de la interfaz.
        is_activated (BooleanField): Estado de activación de la interfaz.
    """

    name = models.CharField(
        max_length=255, verbose_name="Nombre de la interfaz"
    )
    logo = models.ImageField(
        upload_to="images_logo/", verbose_name="Logo", null=True, blank=True
    )
    name_institution = models.CharField(
        max_length=255, verbose_name="Nombre de la institución"
    )
    
    font_primary = models.CharField(
        max_length=255, verbose_name="Fuente primaria"
    )
    font_secondary = models.CharField(
        max_length=255, verbose_name="Fuente secundaria"
    )
    font_third = models.CharField(
        max_length=255, verbose_name="Fuente terciaria"
    )

    primary_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color primario",
    )
    secondary_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color secundario"
    )
    third_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color terciario"
    )
    success_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color de éxito"
    )
    error_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color de error"
    )
    warning_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color de advertencia"
    )
    info_color = ColorField(
        blank=True,
        default="#FFFFFF",
        help_text="#FFFFFF",
        max_length=10,
        verbose_name="Color de información"
    )

    is_activated = models.BooleanField(
        verbose_name="Activado", default=True
    )

    class Meta:
        verbose_name = "Interfaz"
        verbose_name_plural = "Interfaz"
        db_table = "interface"

    def __str__(self):
        return f"Interfaz: {self.name}"  # Return the name of the interface


class Schedule(models.Model):
    """
    Modelo para los horarios.
    Este modelo almacena los horarios de estudio de los estudiantes, incluyendo la hora de inicio y fin de la clase, el día de la semana y el aula asignada.

    Attributes:
        start_time (TimeField): Hora de inicio de la clase.
        end_time (TimeField): Hora de fin de la clase.
        day_of_week (CharField): Día de la semana en que se imparte la clase.
        category (ForeignKey): Categoria del horario.
    """

    start_time = models.TimeField(
        verbose_name="Hora de inicio"
    )  # Hora de inicio de la clase
    end_time = models.TimeField(verbose_name="Hora de fin")  # Hora de fin de la clase
    day_of_week = models.CharField(
        max_length=10, verbose_name="Día de la semana"
    )  # Día de la semana en que se imparte la clase
    category_schedule = models.ForeignKey(
        Category,
        related_name="category_schedule",
        on_delete=models.CASCADE,
        verbose_name="Categoria",
    )  # Categoria del horario

    class Meta:
        verbose_name = "Horario de estudio"
        verbose_name_plural = "Horarios de estudio"
        db_table = "study_schedules"

    def __str__(self):
        return f"Horario: {self.start_time} a {self.end_time} / {self.day_of_week} - {self.category_schedule}"  # Return the schedule


class Resource(models.Model):
    """
    Modelo para los recursos universitarios.
    Este modelo almacena la información de los recursos universitarios, incluyendo el nombre, cantidad y tipo de recurso.

    Attributes:
        name (CharField): Nombre del recurso.
        state (CharField): Estado del recurso, depende del recurso puede estar limpio, sucio, funcional o dañado.
        type (CharField): Tipo de recurso, puede ser elemento tecnologico, mueble, elemento de laboratorio, entre otros.
        reference (CharField): Referencia del recurso, puede estar relacionado a un codigo de barras.
    """

    name = models.CharField(
        max_length=255, verbose_name="Nombre del recurso"
    )  # Nombre del recurso
    state = models.CharField(
        max_length=255, verbose_name="Estado", default="Funcional"
    )  # Estado del recurso
    type_resource = models.ForeignKey(
        Category,
        related_name="type_resourse",
        on_delete=models.CASCADE,
        verbose_name="Tipo de recurso",
    )  # Tipo de recurso
    reference = models.CharField(
        max_length=255, verbose_name="Referencia"
    )  # Referencia del recurso

    class Meta:
        verbose_name = "Recurso universitario"
        verbose_name_plural = "Recursos universitarios"
        db_table = "university_resources"

    def __str__(self):
        return f"{self.type_resource} - {self.name} "  # Return the name of the resource


class Room(models.Model):
    """
    Modelo para los Salones.
    Este modelo almacena la información de los salones de la universidad, incluyendo el nombre, disponibilidad,
    aforo, area, el edificio relacionado.

    Attributes:
        name (CharField): Nombre del aula.
        availability (BooleanField): Disponibilidad del aula
        capacity (IntegerField): Capacidad del aula.
        area (FloatField): Area del aula.
        floor (IntegerField): Piso del aula.
        object_father (ForeignKey): Edificio relacionado.
        schedule (ManyToManyField): Horarios del aula.
        resources (ManyToManyField): Recursos disponibles en el aula.
        type (ForeignKey): Tipo de aula.
    """

    name = models.CharField(max_length=255, verbose_name="Nombre del aula")
    availability = models.BooleanField(verbose_name="Disponibilidad", default=True)
    image_room = models.ImageField(
        upload_to="images_rooms/", verbose_name="Imagen del aula", null=True, blank=True
    )
    capacity = models.IntegerField(
        verbose_name="Capacidad", null=True, blank=True, default=30
    )
    area = models.FloatField(verbose_name="Area", null=True, blank=True)
    floor = models.IntegerField(verbose_name="Piso", default=1)
    object_father = models.ForeignKey(
        CzmlObject,
        related_name="object_father",
        on_delete=models.CASCADE,
        verbose_name="Edificio",
    )
    schedule = models.ManyToManyField(
        Schedule, related_name="schedule_availability", verbose_name="Horarios"
    )
    resources = models.ManyToManyField(
        Resource,
        related_name="resources",
        verbose_name="Recursos",
    )
    type_room = models.ForeignKey(
        Category,
        related_name="type_room",
        on_delete=models.CASCADE,
        verbose_name="Tipo de aula",
    )
    location = models.ForeignKey(
        Node,
        related_name="location_room",
        on_delete=models.CASCADE,
        verbose_name="Ubicación",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Aula"
        verbose_name_plural = "Aulas"
        db_table = "rooms"

    def __str__(self):
        return f"Room: {self.name}"  # Return the name of the room


class Faculty(models.Model):
    """
    Modelo para las facultades.
    Este modelo almacena la información de las facultades de la universidad, incluyendo el nombre y decano.

    Attributes:
        name (CharField): Nombre de la facultad.
        dean (CharField): Decano de la facultad.
        location (ForeignKey): Ubicación de la facultad.
        description (TextField): Descripción de la facultad (por defecto: vacío).

    """

    name = models.CharField(
        max_length=255, verbose_name="Nombre de la facultad"
    )  # Nombre de la facultad
    dean = models.CharField(
        max_length=255, verbose_name="Decano", null=True, blank=True
    )  # Decano de la facultad
    location = models.ForeignKey(
        Node,
        related_name="location_faculty",
        on_delete=models.CASCADE,
        verbose_name="Ubicación",
        null=True,
        blank=True,
    )  # Ubicación de la facultad
    description = models.TextField(
        verbose_name="Descripción",
        default="",
        null=True,
        blank=True,
    )  # Descripción de la facultad

    class Meta:
        verbose_name = "Facultad"
        verbose_name_plural = "Facultades"
        db_table = "faculties"

    def __str__(self):
        return f"Faculty: {self.name}"  # Return the name of the faculty


class Career(models.Model):
    """
    Modelo para las carreras.
    Este modelo almacena la información de las carreras de la universidad, incluyendo el nombre, código, duración y decano.

    Attributes:
        name (CharField): Nombre de la carrera.
        code (CharField): Código de la carrera.
        duration (IntegerField): Duración de la carrera en años.
        snies_code (CharField): Código SNIES de la carrera.
        faculty (ForeignKey): Facultad a la que pertenece la carrera.
        url_webpage (URLField): Página web de la carrera (por defecto: vacío).
        description (TextField): Descripción de la carrera (por defecto: vacío).
    """

    name = models.CharField(
        max_length=255, verbose_name="Nombre de la carrera"
    )  # Nombre de la carrera
    code = models.CharField(
        max_length=20, verbose_name="Código de la carrera"
    )  # Código de la carrera
    duration = models.IntegerField(
        verbose_name="Duración de la carrera"
    )  # Duración de la carrera en años
    snies_code = models.CharField(
        max_length=20, verbose_name="Código SNIES"
    )  # Código SNIES de la carrera
    faculty = models.ForeignKey(
        Faculty,
        related_name="faculty",
        on_delete=models.CASCADE,
        verbose_name="Facultad",
    )  # Facultad a la que pertenece la carrera
    url_webpage = models.URLField(
        verbose_name="Página web",
        default="",
        null=True,
        blank=True,
    )  # Página web de la carrera
    description = models.TextField(
        verbose_name="Descripción", default=""
    )  # Descripción de la carrera

    class Meta:
        verbose_name = "Carrera"
        verbose_name_plural = "Carreras"
        db_table = "careers"

    def __str__(self):
        return f"{self.name} - {self.code}"  # Return the name of the career


class Course(models.Model):
    """
    Modelo para los cursos.
    Este modelo almacena la información de los cursos de la universidad, incluyendo el nombre, código, semestre, créditos y profesor asignado.

    Attributes:
        name (CharField): Nombre del curso.
        code (CharField): Código del curso.
        semester (IntegerField): Semestre en el que se imparte el curso.
        credits (IntegerField): Créditos del curso.
        career (ForeignKey): Carrera a la que pertenece el curso.
        Schedule (ManyToManyField): Horario de estudio del curso.
        number_group (IntegerField): Número de grupo del curso.
        description (TextField): Descripción del curso (por defecto: vacío).

    """

    name = models.CharField(
        max_length=255, verbose_name="Nombre del curso"
    )  # Nombre del curso
    code = models.CharField(
        max_length=20, verbose_name="Código del curso"
    )  # Código del curso
    semester = models.IntegerField(
        verbose_name="Semestre"
    )  # Semestre en el que se imparte el curso
    credits = models.IntegerField(
        verbose_name="Créditos del curso"
    )  # Créditos del curso
    teacher = models.CharField(
        max_length=255, verbose_name="Profesor"
    )  # Profesor asignado al curso
    career = models.ForeignKey(
        Career, related_name="career", on_delete=models.CASCADE, verbose_name="Carrera"
    )  # Carrera a la que pertenece el curso
    Schedule = models.ManyToManyField(
        Schedule, related_name="schedule_course", verbose_name="Horario"
    )  # Horario de estudio del curso

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"
        db_table = "courses"

    def __str__(self):
        return f"Course: {self.name} - {self.code}"  # Return the name of the course


class Course_User(models.Model):
    """
    Modelo para los cursos de los usuarios.
    Este modelo almacena la información de los cursos asignados a los usuarios, incluyendo el usuario, curso y grupo.

    Attributes:
        user (ForeignKey): Usuario al que se asigna el curso.
        course (ForeignKey): Curso asignado al usuario.
        group (IntegerField): Número de grupo del curso.
    """

    user = models.ForeignKey(
        User,
        related_name="person_course",
        on_delete=models.CASCADE,
        verbose_name="Miembro",
    )  # Usuario al que se asigna el curso
    course = models.ForeignKey(
        Course, related_name="course", on_delete=models.CASCADE, verbose_name="Curso"
    )  # Curso asignado al usuario
    group = models.IntegerField(verbose_name="Grupo")  # Número de grupo del curso

    class Meta:
        verbose_name = "Curso de usuario"
        verbose_name_plural = "Cursos de usuario"
        db_table = "courses_users"

    def __str__(self):
        return (
            f"{self.course} - {self.user}"  # Return the name of the course and the user
        )
