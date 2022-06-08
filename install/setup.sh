#!/bin/bash

sudo apt update && sudo apt upgrade -y
sudo rm -rf /tmp/*
cd /tmp/

sudo apt-get install -y python3-venv
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
source $HOME/.poetry/env

sudo apt update
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs

sudo apt update
sudo npm -g install create-react-app

sudo apt update
sudo apt purge -y apache2 
sudo apt install -y apache2
sudo systemctl restart apache2

sudo a2enmod ssl
sudo a2enmod lbmethod_byrequests
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod headers
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_ajp
sudo a2enmod proxy_connect
sudo a2enmod proxy_balancer
sudo a2enmod proxy_html

NAME="raspiwifirepeater"
HOSTNAME=$NAME".local"
PORT=1333

CPATH="/etc/apache2/sites-available/"
CONF_FILE=$CPATH"$NAME.conf"

router_interface="wlan1" # Router interface
repeater_interface="wlan0" # Access point interface

output=$(/sbin/iw dev)
if [[ $output =~ $router_interface && $output =~ $repeater_interface ]]; then
    cd $CPATH
    sudo rm -rf $CONF_FILE
    sudo chown $USER:$USER $CPATH

    {
        echo "<VirtualHost *:80>"
        echo "   ServerName $HOSTNAME"
        echo "   ServerAlias $HOSTNAME"
        echo "   ServerAdmin webmaster@$HOSTNAME"
        echo "   RewriteEngine On"
        echo "   RewriteCond %{HTTP:Upgrade} =websocket [NC]"
        echo "   RewriteRule /(.*)            ws://127.0.0.1:$PORT/""$""1 [P,L]"
        echo "   RewriteCond %{HTTP:Upgrade} !=websocket [NC]"
        echo "   RewriteRule /(.*)            http://127.0.0.1:$PORT/""$""1 [P,L]"
        echo "   ProxyPassReverse / http://127.0.0.1:$PORT/"
        echo "</VirtualHost>"
    } > $CONF_FILE

    sudo a2dissite 000-default.conf
    sudo a2ensite "$NAME.conf"
    sudo systemctl restart apache2
    sleep 1

    cd /var/opt/raspiwifirepeater/
    iPATH="/var/opt/raspiwifirepeater/install/"
    sudo chmod +x $iPATH"config_systemd.sh"
    sudo $iPATH"config_systemd.sh"

    cd /var/opt/raspiwifirepeater
    poetry install
    cd raspiwifirepeater/frontend
    npm install
    sudo npm install -g --unsafe-perm=true --allow-root
    sudo chown -R $USER:$USER /var/opt/raspiwifirepeater/*

    cd /var/opt/raspiwifirepeater/raspiwifirepeater/backend
    git clone https://github.com/agostinhoramos/pylan.git

    wlan_lang="PT"
    wlan_pass="11223344"
    rand_name=$(( ( RANDOM % 9999 )  + 1000 ));
    rand_network=$(( ( RANDOM % 240 )  + 5 ));
    SSID_NAME="Raspi WiFi Repeater-$rand_name"
    NETWORK="192.168.$rand_network.1"
    FPATH="/var/opt/raspiwifirepeater/raspiwifirepeater/backend/pylan/pylan/shell/"
    sudo $FPATH"ap_conf.sh" "$SSID_NAME" "$wlan_pass" 1 "$NETWORK" "$repeater_interface" "$wlan_lang"
    echo "Network $SSID_NAME created successfully."

    sudo python $iPATH"seed.py" "$router_interface" "$repeater_interface" "$SSID_NAME" "$wlan_pass" "WPA-PSK" "$NETWORK"

    cd /var/opt/raspiwifirepeater

else
    echo "Not found interfaces [$router_interface, $repeater_interface]. check them with iwconfig"
fi
