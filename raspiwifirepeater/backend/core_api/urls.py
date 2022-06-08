import sys
from django.urls import path
from core_api.views import *

urlpatterns = [
    path('v1/network/status/', NetworkStatusView, name="NetworkStatusView"),
    path('v1/network/scan/', NetworkScanView, name="NetworkScanView"),
    path('v1/network/create/', NetworkCreateView, name="NetworkCreateView"),
    path('v1/network/settings/', NetworkSettingsView, name="NetworkSettingsView"),
]