# How to install backend?

1 - Create backend project

    ~$ cd /var/opt/raspiwifirepeater/raspiwifirepeater
    /var/opt/raspiwifirepeater/raspiwifirepeater$ sudo chown -R $USER:$USER ../raspiwifirepeater
    /var/opt/raspiwifirepeater/raspiwifirepeater$ poetry shell
    /var/opt/raspiwifirepeater/raspiwifirepeater$ django-admin startproject backend

    Result: 
    ├── backend
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    ├── manage.py

2 - Create backend app
    
    /var/opt/raspiwifirepeater/raspiwifirepeater$ cd backend
    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ python manage.py startapp core_api

    ├── backend
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    ├── manage.py
    └── core_api
        ├── __init__.py
        ├── admin.py
        ├── apps.py
        ├── migrations
        │   └── __init__.py
        ├── models.py
        ├── tests.py
        └── views.py
    
3 - Go to settings:

    ├── backend
    │   ├── __init__.py
    │   ├── settings.py <--
    │   ├── urls.py
    │   ├── wsgi.py
    ├── manage.py

    Code from "settings.py" file, please change:

        ALLOWED_HOSTS = [
            "raspiwifirepeater.local",
            "raspiwifirepeater.local:1332"
        ]
        
        INSTALLED_APPS = [
            ...
            'corsheaders',
            'core_api',
        ]

        MIDDLEWARE = [
            ...
            'corsheaders.middleware.CorsMiddleware',
            'corsheaders.middleware.CorsPostCsrfMiddleware',
        ]

        CORS_ALLOWED_ORIGINS = [
            'http://raspiwifirepeater.local',
        ]

        CORS_ALLOW_METHODS = [
            "DELETE",
            "GET",
            "OPTIONS",
            "PATCH",
            "POST",
            "PUT",
        ]

4 - Change backend urls.py:

    ├── backend
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py <--
    │   ├── wsgi.py
    ├── manage.py

    Code from "urls.py" file:
        ...
        from django.urls import include, path

        urlpatterns = [
            ...
            path('api/', include('core_api.urls')),
        ]

5 - Setting up core_api application:
    
    * Inside core_api application add "urls.py" file

    ├── backend
    ...
    ├── manage.py
    └── core_api
        ...
        ├── urls.py <--
        └── views.py

        Code from "urls.py" file:
            
            import sys
            from django.urls import path
            from core_api.views import *

            urlpatterns = [
                path('v1/network/status/', NetworkStatusView, name="NetworkStatusView"),
                path('v1/network/scan/', NetworkScanView, name="NetworkScanView"),
                path('v1/network/create/', NetworkCreateView, name="NetworkCreateView"),
                path('v1/network/settings/', NetworkSettingsView, name="NetworkSettingsView"),
            ]

    * Inside core_api application add "serializers.py" file

    ├── backend
    ...
    ├── manage.py
    └── core_api
        ...
        ├── serializers.py <--
        ...
        └── views.py
    
        Code from "serializers.py" file:
            from django.db import models
            from django.db.models import fields
            from rest_framework import serializers
            from .models import *


            class NetworkSerializer(serializers.ModelSerializer):
                class Meta:
                    model = Network
                    fields = [
                        'ssid', 'pswd', 'mgmt', 'interface', 'ipaddress', 'mac', 'status', 'enabled'
                    ]

            class SettingSerializer(serializers.ModelSerializer):
                class Meta:
                    model = Setting
                    fields = [
                        'ipaddress', 'router', 'apoint', 'state', 'wifi'
                    ]

    * Inside core_api application change "admin.py" file:

        from django.contrib import admin
        # Register your models here.
        from .models import *

        class NetworkConfig(admin.ModelAdmin):
            list_display = ('ssid', 'pswd', 'mgmt', 'interface', 'ipaddress', 'mac', 'status', 'enabled')
            list_filter = ("ssid",)
        admin.site.register(Network, NetworkConfig)

        class SettingConfig(admin.ModelAdmin):
            list_display = ('ipaddress', 'router', 'apoint', 'state', 'wifi')
        admin.site.register(Setting, SettingConfig)


    * Inside core_api application change "models.py" file:

        from django.db import models
        from django.utils.timezone import now
        # Create your models here.

        class Network(models.Model):
            ssid = models.CharField(max_length=90)
            pswd = models.CharField(max_length=100)
            mgmt = models.CharField(max_length=20)
            interface = models.CharField(max_length=20)
            ipaddress = models.CharField(max_length=20, blank=True, null=True, unique=True)
            mac = models.CharField(max_length=20, blank=True, null=True)
            status = models.IntegerField(default=0)
            enabled = models.IntegerField(default=1)
            updated_on = models.DateTimeField(auto_now=True)
            created_at = models.DateTimeField(auto_now_add=True)

            def save(self, *args, **kwargs):
                if not self.created_at:
                    self.updated_on = now()
                    self.created_at = now()
                super().save(*args, **kwargs)

            class Meta:
                ordering = ['-created_at']

            def __str__(self):
                return self.ssid

        class Setting(models.Model):
            ipaddress = models.CharField(max_length=20, blank=True, null=True)
            router = models.IntegerField(default=0)
            apoint = models.IntegerField(default=0)
            state = models.IntegerField(default=0)
            wifi = models.IntegerField(default=1)
            updated_on = models.DateTimeField(auto_now=True)
            created_at = models.DateTimeField(auto_now_add=True)

            def save(self, *args, **kwargs):
                if not self.created_at:
                    self.updated_on = now()
                    self.created_at = now()
                super().save(*args, **kwargs)

            class Meta:
                ordering = ['-created_at']

            def __str__(self):
                return str(self.wifi)

    * Inside core_api application change "views.py" file:
        from django.shortcuts import render

        # Create your views here.
        from django.http.response import JsonResponse
        import io, jwt, sys, datetime, time, json, math
        from django.db.models import F, Count
        from django.views.decorators.csrf import csrf_exempt

        from .models import *
        from .serializers import *
        from lib import *

        @csrf_exempt
        def NetworkStatusView(request):
            if request.method == 'GET':
                pass
            if request.method == 'POST':
                pass
            return JsonResponse({})

        @csrf_exempt
        def NetworkScanView(request):
            if request.method == 'GET':
                pass
            if request.method == 'POST':
                pass
            return JsonResponse({})
        
        @csrf_exempt
        def NetworkSettingsView(request):
            if request.method == 'GET':
                pass
            if request.method == 'POST':
                pass
            return JsonResponse({})
        
        @csrf_exempt
        def NetworkCreateView(request):
            if request.method == 'GET':
                pass
            if request.method == 'POST':
                pass
            return JsonResponse({})

6 - Create lib folder inside "backend" project:

    ├── backend
    ├── lib <--
    ├── pylan <--
    ...
    ├── manage.py
    └── core_api

    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ git clone https://github.com/agostinhoramos/pylan.git

    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ sudo mkdir lib && cd lib


    /var/opt/raspiwifirepeater/raspiwifirepeater/backend/lib$ sudo touch __init__.py

7 - Make migrations:

    /var/opt/raspiwifirepeater/raspiwifirepeater/backend/lib$ cd ..


    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ python manage.py makemigrations


    
    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ python manage.py migrate


    
    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ python manage.py createsuperuser

        Username (leave blank to use 'master'): master
        Email address:
        Password: over123
        Bypass password validation and create user anyway? [y/N]: y
        Superuser created successfully.


8 - Create index.py file inside backend folder

    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ sudo touch index.py

    Code from "index.py" file:
        #!/usr/bin/python
        import sys, os

        from dotenv import dotenv_values
        _env = dotenv_values(".env.local")
        sys.path.append( _env["ROOT_PATH"] )

        def init(argv):
            if len(argv) > 0:
                pass
            os.system('python raspiwifirepeater/backend/manage.py runserver 0.0.0.0:{}'.format(_env["SERVER_BACKEND_PORT"]))

9 - Crate .env.local file

    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ cd ../../

    /var/opt/raspiwifirepeater$ sudo touch .env.local

    Code from ".env.local" file:
        ROOT_HOST=raspiwifirepeater.ddns.net

        ROOT_PATH=/var/opt/RaspiWiFiRepeater/
        ROOT_PATH_FRONTEND=${ROOT_PATH}frontend/
        ROOT_PATH_BACKEND=${ROOT_PATH}backend/

        PROD_MOD=0
        USE_HTTPS=0

        SYSTEM_SECRET=F874T3GTUI437RTF783TGREW78GTRIUEGRE

        ## SERVER
        SERVER_FRONTEND_PORT=1333
        SERVER_BACKEND_PORT=1332


10 - Get started

    /var/opt/raspiwifirepeater$ cd raspiwifirepeater/backend
    /var/opt/raspiwifirepeater/raspiwifirepeater/backend$ python manage.py runserver
    