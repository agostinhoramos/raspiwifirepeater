# Install Raspi WiFi Repeater Frontend

## How to install?
- <b>/var/opt/$</b> cd /var/opt/raspiwifirepeater
- <b>/var/opt/raspiwifirepeater$</b> poetry shell
- <b>/var/opt/raspiwifirepeater$</b> poetry install
- <b>/var/opt/raspiwifirepeater$</b> cd raspiwifirepeater/frontend
- <b>/var/opt/raspiwifirepeater/raspiwifirepeater/frontend$</b> npm install
- <b>/var/opt/raspiwifirepeater/raspiwifirepeater/frontend$</b> sudo npm install -g --unsafe-perm=true --allow-root
- <b>/var/opt/raspiwifirepeater/raspiwifirepeater/frontend$</b> sudo chown -R $USER:$USER /var/opt/raspiwifirepeater/*
- <b>/var/opt/$</b> cd /var/opt/raspiwifirepeater
- <b>/var/opt/raspiwifirepeater$</b> python main.py
- <b>/var/opt/raspiwifirepeater$</b> sudo /sbin/reboot