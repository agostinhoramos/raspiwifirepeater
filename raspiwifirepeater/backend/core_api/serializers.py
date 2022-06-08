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