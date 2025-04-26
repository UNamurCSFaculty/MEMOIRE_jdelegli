## Prerequisites

> This consider having a raspberrypi installed with 64 bit Raspberry pi OS

### Install CEC utilities

> There is apparently a problem in the raspberry pi os package repo, so we have to manually install one package from debian

```
wget http://ftp.de.debian.org/debian/pool/main/p/p8-platform/libp8-platform2_2.1.0.1+dfsg1-4_arm64.deb
sudo apt install ./libp8-platform2_2.1.0.1+dfsg1-4_arm64.deb
sudo apt-get install cec-utils
```

Test the installation :

> This command will start the HDMI connected device on port 0 (closest to the power button)

```
echo 'on 0' | cec-client -s -d 1
```

### Install node.js

> Again, we need to workaround missing packages from raspberry pi OS repo

```
sudo apt install curl -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Test the installation

```
node -v
v20.19.0
```

### Trust the root CA (see elder-rings project) and define elder-rings app hosts entries

> If you enabled SSH, with username pi, from root of elder-rings project

```
cd platform\nginx\certs
scp rootCA.crt pi@raspberrypi.local:/tmp/
ssh pi@raspberrypi.local
sudo cp /tmp/rootCA.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
echo -e "192.168.0.164 elder-rings.local\n192.168.0.164 keycloak.local" | sudo tee -a /etc/hosts > /dev/null
```

> /!\ in my case 192.168.0.164 is the host on which the elder-rings application run, change it depending on your network

### Configure chromium

> Chromium come by default with Respberry pi os install, so you don't need to do install it

1. Launch Chromium and go to:

```
chrome://settings/certificates
```

2. Under "Authorities", click Import and select `rootCA.crt` from `/usr/local/share/ca-certificates/`

3. Check: ✅ Trust this certificate for identifying websites

Done — Chromium will now trust anything signed by your root CA

### Setup user / password (or a better solution would be to have a certificate for this)

Simply replace the user / password in the `elder-ring-client.js` script

### Copy the script on the server

from root of elder-rings-client project

```
scp package.json elder-ring-client.js pi@raspberrypi.local:~/elder-ring-client/
```

### Register your device for that user (manual step)

1. Go to the keycloak admin interface

https://keycloak.local/auth/admin/master/console/

2. Setup the user to register the device on next auth

Under realm `elderrings`, go to `Users` tab, select your user and add a `Required user actions` of type `Webauthn Register Passwordless`

3. From your raspberry pi browser, connect

https://elder-rings.local/elder-rings/

Enter the user credentials, then follow steps to register the device

### Run the application

> This require the elder-rings app to be running on your "server"

```
node elder-ring-client.js
```

To test it, start a call from any account to the account you configured

### Auto start the script on boot
