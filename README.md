# SIGO 3D V2 - Sistema de Información Geográfica Online 3D

Este proyecto es una versión mejorada del sistema SIGO 3D de la Universidad de los Llanos https://gitlab.com/adalab_unillanos/docker_sigo3d.git . 
Permite visualizar, gestionar y navegar por el campus universitario a través de un entorno interactivo basado en CesiumJS y Django.

## Tecnologías principales

- Python 3.12
- Django
- PostgreSQL 16
- -Cesium
- Docker + Docker Compose

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Instalación y ejecución

### 1. **Clona el repositorio**

```bash
git clone https://github.com/RicardoVal39/Sigo3DV2.git
```
### 2. **Construye y levanta los contenedores**

```bash
docker-compose up --build
```

### 3. **Aplica las migraciones de Django**

```bash
docker-compose exec django python Sigo3DV2/manage.py migrate
```
### 4. **Restaura la base de datos**

```bash
docker cp UnillanGO.backup sigo3dv2-db-1:/UnillanGO.backup
docker exec -it sigo3dv2-db-1 bash
```
Una vez dentro del contenedor de PostgreSQL:
```bash
pg_restore -U postgres -d UnillanGO /UnillanGO.backup
exit
```
## Acceso a la aplicación
Una vez levantado todo, puedes acceder a la aplicación desde tu navegador en:
```
http://localhost:8000
```
## Estructura del proyecto 
- Sigo3DV2/ - Código fuente del backend Django.
- Sigo3DV2/media/ - Archivos subidos y recursos multimedia.
- Sigo3DV2/static/ - Archivos estáticos.
- UnillanGO.backup - Backup de la base de datos PostgreSQL.
- Dockerfile y docker-compose.yml - Configuración del entorno Docker.

Proyecto desarrollado por Ricardo Valencia Barrera con la Direccion de Ing. CÉSAR AUGUSTO DÍAZ CELIS, M.Sc y ÁNGEL ALFONSO CRUZ ROA, M.Sc., Ph.D - Facultad de Ingeniería, Universidad de los Llanos.
