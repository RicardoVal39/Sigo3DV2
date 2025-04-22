# Imagen base
FROM python:3.12-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo
WORKDIR /Sigo3DV2/Sigo3DV2

# Copia los archivos del proyecto
COPY . .

# Instala dependencias
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Expone el puerto para el servidor Django
EXPOSE 8000

# Comando por defecto para desarrollo
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]