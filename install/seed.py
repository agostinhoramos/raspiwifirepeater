#!/usr/bin/python

from subprocess import check_output
import os, sys, time, socket, sqlite3, urllib.request, subprocess

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

def isOnline():
    try:
        socket.setdefaulttimeout(3)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(('8.8.8.8', 53))
        return True
    except socket.error as ex:
        print(ex)
        return False

def IPAddress(is_private=False, config={}):
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

def get_iwConf(interface, target):
    
    sQuery=""
    sLeft=""
    sRight=""

    if target == 'essid':
        sQuery="ESSID"
        sLeft="ESSID:\""
        sRight="\""
    if target == 'mac':
        sQuery="Access Point:"
        sLeft="Access Point: "
    if target == 'quality':
        sQuery="Link Quality="
        sLeft="Link Quality="
        sRight="  Signal"

    proc1 = subprocess.Popen(['sudo', 'iwconfig', interface], stdout=subprocess.PIPE)
    proc2 = subprocess.Popen(['egrep', "{}".format(sQuery)], stdin=proc1.stdout,
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, err = proc2.communicate()
    out = output.decode('ascii')
    aux = ""

    try: aux = out.split(sLeft)[1]
    except: pass
    try: aux = aux.split(sRight)[0]
    except: pass

    aux = aux.strip()

    if target == 'quality':
        n = aux.split("/")
        aux = (int(n[0]) * 100) / int(n[1])

    return aux

con = sqlite3.connect('/var/opt/raspiwifirepeater/raspiwifirepeater/backend/db.sqlite3')
cur = con.cursor()

q = cur.execute('SELECT * FROM core_api_network')
r = q.fetchall()

if len(r) < 2:

    ROUTER_INTERFACE=sys.argv[1]
    REPEATER_INTERFACE=sys.argv[2]
    REPEATER_SSID=sys.argv[3]
    REPEATER_PSWD=sys.argv[4]
    REPEATER_MGMT=sys.argv[5]

    ROUTER_STATUS="0"
    ROUTER_ENABLED="0"    
    REPEATER_STATUS="1"
    REPEATER_ENABLED="1"

    HAVE_WIFI = 0
    if isOnline():
        HAVE_WIFI = 1
        ROUTER_ENABLED="1"
    
    ROUTER_IPADDRESS=IPAddress(True, {"interface": ROUTER_INTERFACE})
    REPEATER_IPADDRESS=sys.argv[6]
    IPADDRESS=IPAddress(config={"interface": REPEATER_INTERFACE})
    ROUTER_SSID=get_iwConf(ROUTER_INTERFACE, 'essid')
    ROUTER_MAC=get_iwConf(ROUTER_INTERFACE, 'mac')

    if len(ROUTER_SSID) > 1:
        ROUTER_STATUS=1
         

    # INSERT ALL DATA
    QUERY="""
    INSERT INTO core_api_network (ssid, pswd, mgmt, interface, ipaddress, status, enabled) 
    VALUES ('{}', '{}', '{}', '{}', '{}', {}, {})
    """.format( REPEATER_SSID, REPEATER_PSWD, REPEATER_MGMT, REPEATER_INTERFACE, REPEATER_IPADDRESS, REPEATER_STATUS, REPEATER_ENABLED )
    cur.execute(QUERY)
    REPEATER_ID = cur.lastrowid

    QUERY="""
    INSERT INTO core_api_network (ssid, interface, ipaddress, mac, status, enabled) 
    VALUES ('{}', '{}', '{}', '{}', '{}', '{}')
    """.format( ROUTER_SSID, ROUTER_INTERFACE, ROUTER_IPADDRESS, ROUTER_MAC, ROUTER_STATUS, ROUTER_ENABLED )
    cur.execute(QUERY)
    ROUTER_ID = cur.lastrowid

    QUERY="""
    INSERT INTO core_api_setting (ipaddress, router, apoint, state, wifi) 
    VALUES ('{}', {}, {}, {}, {})
    """.format(IPADDRESS, ROUTER_ID, REPEATER_ID, 1, HAVE_WIFI)
    cur.execute(QUERY)

    print('OK')
else:
    print('NOK')

con.commit()
con.close()