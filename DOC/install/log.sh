## RaspiWiFiRepeater (Step by step)
sudo apt update
sudo apt install ufw -y
sudo apt install libz-dev libssl-dev libcurl4-gnutls-dev libexpat1-dev gettext cmake gcc -y
sudo apt install curl openjdk-11-jdk -y

sudo apt update && sudo apt upgrade -y

curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
source $HOME/.poetry/env

curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis -y

sudo apt install nmap -y
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip -y

cd /tmp
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs

sudo apt update
#sudo apt install npm -y
sudo npm -g install create-react-app

sudo apt update
sudo apt purge -y apache2 
sudo apt install -y apache2
sudo systemctl restart apache2


# Setting up path
cd /var/opt/
sudo apt-get install python3-distutils
sudo chown -R $USER:$USER ../opt/
poetry new RaspiWiFiRepeater


# Setting up frontend
cd /var/opt/RaspiWiFiRepeater/raspiwifirepeater/
# create-react-app --version
create-react-app frontend


# Setting up backend
cd /var/opt/RaspiWiFiRepeater/raspiwifirepeater/
django-admin startproject backend
cd backend && python manage.py startapp core_api && cd ..
python backend/manage.py makemigrations
python backend/manage.py migrate
python backend/manage.py createsuperuser
    e: master
    p: over1234

