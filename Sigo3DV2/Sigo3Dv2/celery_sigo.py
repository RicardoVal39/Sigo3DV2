import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sigo3DV2.settings')

app = Celery('Sigo3DV2')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()