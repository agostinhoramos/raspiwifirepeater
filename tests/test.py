#importing the subprocess module
import subprocess

def scanSSID(interface):
    proc1 = subprocess.Popen(['nmcli', 'device', 'wifi', 'list', 'ifname', str(interface)], stdout=subprocess.PIPE)
    proc2 = subprocess.Popen(['grep', 'Infra'], stdin=proc1.stdout,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    proc1.stdout.close() # Allow proc1 to receive a SIGPIPE if proc2 exits.
    out, err = proc1.communicate()
    # out = out.decode('ascii')
    # out = out.replace("\r","")
    # out = out.replace("\tSSID: ", "")
    # out = [x for x in out.split("\n") if x != ""]
    return out


print(
    scanSSID('wlan1')
)