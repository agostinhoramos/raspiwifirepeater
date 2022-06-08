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