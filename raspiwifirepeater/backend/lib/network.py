#!/usr/bin/python

from subprocess import check_output
import os, json, socket, urllib.request, subprocess
from lib import convert

def _cmd_output(proc=None, output=None):
    out=None
    if proc:
        out, err = proc.communicate()
        out = out.decode('ascii')
        out = out.replace("\r","").replace("\n","")
    if output:
        out = output.decode('ascii')
        out = out.replace("\r","").replace("\n","")
    return out

class Networks:
    def __init__(self, *args, **kwargs):
        self.ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    def isOnline(self):
        try:
            socket.setdefaulttimeout(3)
            socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(('8.8.8.8', 53))
            return True
        except socket.error as ex:
            print(ex)
            return False

    def IPAddress(self, is_private=False, config={}):
        if is_private:
            ip = None
            interface = config['interface']
            if interface:
                proc1 = subprocess.Popen(['ifconfig', interface], stdout=subprocess.PIPE)
                proc2 = subprocess.Popen(['egrep', '-o', 'inet [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'], stdin=proc1.stdout,
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                proc3 = subprocess.Popen(['cut', '-d', ' ', '-f2'], stdin=proc2.stdout,
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                proc1.stdout.close()
                ip = _cmd_output(proc=proc3)
        else:
            try:
                ip = urllib.request.urlopen('http://ident.me')\
                .read().decode('utf8')
            except:
                proc1 = subprocess.Popen(['hostname', '-I'], stdout=subprocess.PIPE)
                proc2 = subprocess.Popen(['awk', '{print $1}'], stdin=proc1.stdout,
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                proc1.stdout.close()
                ip = _cmd_output(proc=proc2)
        
        return ip

    def qualityToLevel(self, value):
        level=2
        try:
            if value < 32:
                level=0
            elif value < 55:
                level=1
        except:
            level=0
        return level

    def searchNetwork(self, list, mac, key):
        for k in list:
            if( k["address"] == mac ):
                return k[key]
        return {}

    def valid_arg(self, model, body):
        wifi_ssid_min_len = 2
        wifi_pass_min_len = 8
        
        inst = model.objects.all()[:1].get()
        is_valid = len(body.get('ssid')) >= wifi_ssid_min_len and len(body.get('pswd')) >= wifi_pass_min_len
        is_valid = is_valid and (inst.ssid != body.get('ssid') or inst.pswd != body.get('pswd') or inst.enabled != convert.boolToInt(body.get('wifi')))
        return is_valid