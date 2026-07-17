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
cd platform/nginx/certs
scp rootCA.crt pi@raspberrypi.local:/tmp/
ssh pi@raspberrypi.local
sudo cp /tmp/rootCA.crt /usr/local/share/ca-certificates/elder-rings-rootCA.crt
sudo update-ca-certificates
echo -e "192.168.0.79 elder-rings.local\n192.168.0.79 keycloak.local" | sudo tee -a /etc/hosts > /dev/null
```

> /!\ in my case 192.168.0.79 is the host on which the elder-rings application run, change it depending on your network

### Copy the script and certificates on the Pi

From root of elder-rings-client project :

```
scp package.json elder-ring-client.js pi@raspberrypi.local:~/elder-rings-client/
```

Copy the room certificate generated from the server (see elder-rings README, section "Provisioning a new room") :

```
scp platform/nginx/certs/room1.crt pi@raspberrypi.local:~/elder-rings-client/certs/
scp platform/nginx/certs/room1.key pi@raspberrypi.local:~/elder-rings-client/certs/
scp platform/nginx/certs/rootCA.crt pi@raspberrypi.local:~/elder-rings-client/certs/
scp platform/nginx/certs/room1.p12 pi@raspberrypi.local:~/elder-rings-client/certs/
```

Install dependencies :

```
cd ~/elder-rings-client && npm install
```

### Configure X.509 client certificate for Chromium

The Pi authenticates to Keycloak using its X.509 certificate instead of a username and password. Chromium needs access to this certificate to handle the browser-based call flow without any user interaction.

1. Install NSS tools

```
sudo apt-get install libnss3-tools -y
```

2. Create the NSS database with no password

```
rm -rf ~/.pki/nssdb
mkdir -p ~/.pki/nssdb
certutil -N -d sql:$HOME/.pki/nssdb -f /dev/null
```

3. Import the room certificate and trust the root CA

```
pk12util -i ~/elder-rings-client/certs/room1.p12 -d sql:$HOME/.pki/nssdb -W elderrings -K ""
certutil -A -n "elder-rings rootCA" -t "C,," -i ~/elder-rings-client/certs/rootCA.crt -d sql:$HOME/.pki/nssdb -f /dev/null
```

4. Configure Chromium to auto-select the certificate for keycloak.local (no user prompt)

```
sudo mkdir -p /etc/chromium/policies/managed
```

```
echo '{"AutoSelectCertificateForUrls":["{\"pattern\":\"https://keycloak.local\",\"filter\":{\"ISSUER\":{\"CN\":\"mkcert nedjed@Ned\"}}}"]}'  | sudo tee /etc/chromium/policies/managed/elderrings.json
```

> /!\ The CN value in the filter must match the issuer CN of the root CA. Check with : `openssl x509 -in certs/rootCA.crt -noout -issuer`

### Run the application

> This require the elder-rings app to be running on your "server"

```
node ~/elder-rings-client/elder-ring-client.js
```

You should see :

```
Authenticated. Connecting to WebSocket...
Connected to WebSocket
```

To test it, start a call from any account to the room account configured on this Pi. Chromium should open automatically and land directly on the call page without any authentication prompt.
