from django.shortcuts import render

# Create your views here.
from django.http.response import JsonResponse
import io, jwt, sys, datetime, time, json, math
from django.db.models import F, Count
from django.views.decorators.csrf import csrf_exempt

from .models import *
from .serializers import *
from lib import network, convert
from pylan.pylan.wlan import *


networks = network.Networks()
wlan = Wlan()


@csrf_exempt
def NetworkStatusView(request):
    response = {}
    if request.method == 'GET':
        obj = {}
        
        try:
            _router = Network.objects.get(interface="wlan1")
            _repeater = Network.objects.get(interface="wlan0")
            _setting = Setting.objects.latest('id')
            r = wlan.getIWList(_repeater.interface)
        except:
            _router = None
            _repeater = None
            _setting = None

        if( _router != None or _repeater != None or _setting != None ):
            
            response["data"] = {
                "internet" : {
                    "address" : _setting.ipaddress,
                    "status": networks.isOnline()
                },
                "router" : {
                    "address" : _router.ipaddress,
                    "ssid" : _router.ssid,
                    "signal" : networks.qualityToLevel(
                        wlan.get_iwConf('wlan1', 'quality')
                    ),
                    "status": convert.intToBool(_router.status) and convert.intToBool(_repeater.enabled)
                },
                "repeater" : {
                    "address" : _repeater.ipaddress,
                    "ssid" : _repeater.ssid,
                    "status": convert.intToBool(_repeater.status)
                },
            }

    return JsonResponse(response)

@csrf_exempt
def NetworkScanView(request):
    response = {}
    if request.method == 'GET':
        rows = wlan.getIWList('wlan0')
        # Add new obj
        for i in range(0, len(rows)):
            r = rows[i]
            if r.get("ssid") != None:

                r["level"]=networks.qualityToLevel(
                    r.get("quality")
                )

                r["sec"]={}
                r["sec"]["boo"]=0
                r["sec"]["name"]="FREE"
                if r["encryption"] :
                    r["sec"]["boo"]=1
                    r["sec"]["name"]=r.get("security")

        response = { "list" : rows[0:20] }
    return JsonResponse(response)

@csrf_exempt
def NetworkSettingsView(request):
    response = {}
    interface="wlan0"
    if request.method == 'GET':
        try:
            network = Network.objects.get(interface=interface)
            serializers = NetworkSerializer(network)
            obj = serializers.data

            network = obj.get("ipaddress")
            ssid = obj.get("ssid")
            pswd = obj.get("pswd")
            wifi = convert.intToBool(obj.get("enabled"))
        except:
            network=None
            ssid=None
            pswd=None
            wifi=False

        response = {
            "network" : network,
            "ssid" : ssid,
            "pswd" : pswd,
            "wifi" : wifi,
        }

    if request.method == 'POST':
        response = { "status" : "NOK" }
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        if networks.valid_arg(Network, body):
            instance = Network.objects.get(interface=interface)
            instance.ipaddress = body.get('network')
            instance.ssid = body.get('ssid')
            instance.pswd = body.get('pswd')
            instance.enabled = convert.boolToInt(body.get('wifi'))
            wlan.resetConfig(interface)
            wlan.setAccessPoint(
                wlanSSID=body.get('ssid'),
                wlanPASS=body.get('pswd'),
                secLevel="1",
                wlanNetwork=body.get('network'),
                wlan=interface
            )
            instance.save()
            response = { "status" : "OK" }
    
    return JsonResponse(response)

@csrf_exempt
def NetworkCreateView(request):
    response = {}
    if request.method == 'POST':
        response = { "status" : "NOK" }
        
        body_unicode = request.body.decode('utf-8')
        j_data = json.loads(body_unicode)
        
        v_security = j_data['config']['security']
        v_mac = j_data['config']['mac']
        v_ssid = j_data['config']['ssid']
        v_pass = j_data['config']['pass']

        # TODO Create list of security type
        print( v_security ) # eg. wpa2

        _network = Network.objects.get(interface="wlan1")
        _network.ssid = v_ssid
        _network.pswd = ''
        _network.mgmt = 'NONE'
        if len(v_pass) > 0:
            _network.pswd = v_pass
            _network.mgmt = 'WPA-PSK'
        _network.mac = v_mac
        _network.ipaddress = networks.IPAddress(
            is_private=True, 
            config={ "interface" : _network.interface }
        )
        _network.enabled = 1
        _network.status = 1
        wlan.resetConfig(_network.interface)
        wlan.setWlanReceiver(
            wlanSSID=_network.pswd,
            wlanPASS=_network.pswd,
            keyMGMT=_network.mgmt,
            wlan=_network.interface
        )
        _network.save()

        if j_data['config']['updateSSID']:
            v_network = "192.168.83.1"
            instance = Network.objects.get(interface="wlan0")
            instance.ipaddress = v_network
            instance.ssid = v_ssid
            instance.pswd = v_pass
            instance.enabled = 1
            instance.mac = ''
            wlan.resetConfig('wlan0')
            wlan.setAccessPoint(
                wlanSSID=v_ssid,
                wlanPASS=v_pass,
                secLevel="1",
                wlanNetwork=v_network,
                wlan='wlan0'
            )
            instance.save()

        # TODO check after 8 seconds
        setting = Setting.objects.all()[:1].get()
        setting.ipaddress=networks.IPAddress()
        setting.state = 1 
        setting.save()

        response = { "status" : "OK" }
    return JsonResponse(response)