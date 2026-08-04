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

> If you enabled SSH, with username elder-rings, from root of elder-rings project

> /!\ The Pi hostname (elder-rings.local through mDNS) is also the application vhost name. If scp/ssh reaches the wrong machine, your dev machine probably resolves elder-rings.local through its own /etc/hosts to the app server: use the Pi's IP address instead in the commands below.

```
cd platform/nginx/certs
scp rootCA.crt elder-rings@elder-rings.local:/tmp/
ssh elder-rings@elder-rings.local
sudo cp /tmp/rootCA.crt /usr/local/share/ca-certificates/elder-rings-rootCA.crt
sudo update-ca-certificates
echo -e "192.168.0.79 elder-rings.local\n192.168.0.79 keycloak.local" | sudo tee -a /etc/hosts > /dev/null
```

> /!\ in my case 192.168.0.79 is the host on which the elder-rings application run, change it depending on your network

### Copy the script and certificates on the Pi

From root of elder-rings-client project :

```
scp package.json elder-ring-client.js elder-rings-cec.service elder-rings-kiosk.desktop elder-rings@elder-rings.local:~/Desktop/
```

Copy the room certificate generated from the server (see elder-rings README, section "Provisioning a new room") :

```
ssh elder-rings@elder-rings.local "mkdir -p ~/Desktop/certs"
scp platform/nginx/certs/room1.crt elder-rings@elder-rings.local:~/Desktop/certs/
scp platform/nginx/certs/room1.key elder-rings@elder-rings.local:~/Desktop/certs/
scp platform/nginx/certs/rootCA.crt elder-rings@elder-rings.local:~/Desktop/certs/
scp platform/nginx/certs/room1.p12 elder-rings@elder-rings.local:~/Desktop/certs/
```

Install dependencies :

```
cd ~/Desktop && npm install
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
pk12util -i ~/Desktop/certs/room1.p12 -d sql:$HOME/.pki/nssdb -W elderrings -K ""
certutil -A -n "elder-rings rootCA" -t "C,," -i ~/Desktop/certs/rootCA.crt -d sql:$HOME/.pki/nssdb -f /dev/null
```

4. Configure Chromium to auto-select the certificate for keycloak.local (no user prompt)

```
sudo mkdir -p /etc/chromium/policies/managed
```

```
echo '{"AutoSelectCertificateForUrls":["{\"pattern\":\"https://keycloak.local\",\"filter\":{\"ISSUER\":{\"CN\":\"mkcert nedjed@Ned\"}}}"]}'  | sudo tee /etc/chromium/policies/managed/elderrings.json
```

> /!\ The CN value in the filter must match the issuer CN of the root CA. Check with : `openssl x509 -in certs/rootCA.crt -noout -issuer`

### Run the CEC wake daemon

The Node script does not open the browser anymore: the kiosk browser runs permanently (next section) and handles the whole call flow (incoming call dialog, resident call policy, WebRTC). The daemon's job is to drive the TV power through HDMI-CEC: it turns the TV on when a call invitation arrives, turns it off after the call ends for dependent residents (everything is automatic for them), and executes the on/off orders sent from the app by the other residents through the TV remote (any key wakes the TV, the back key turns it off outside a call). It fetches a fresh token and reconnects automatically whenever the connection drops.

Manual run (requires the elder-rings app to be running on your "server") :

```
node ~/Desktop/elder-ring-client.js
```

You should see :

```
Authenticated. Connecting to WebSocket...
Connected to WebSocket
```

Install it as a systemd service so it starts with the Pi :

```
sudo cp ~/Desktop/elder-rings-cec.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now elder-rings-cec
```

> /!\ The service file assumes the project lives in /home/elder-rings/Desktop and node is in /usr/bin, adapt if needed. Check the daemon with `systemctl status elder-rings-cec` or `journalctl -u elder-rings-cec -f`.

### Run the kiosk browser

Chromium runs permanently in kiosk mode on the platform home page. It authenticates through /room-login with the room certificate (no user interaction thanks to the AutoSelectCertificateForUrls policy), then the React app takes over: the resident can start calls with the TV remote, and incoming calls either show the incoming call dialog or join automatically depending on the resident call policy.

Enable it at session startup :

```
mkdir -p ~/.config/autostart
cp ~/Desktop/elder-rings-kiosk.desktop ~/.config/autostart/
```

> /!\ The `--autoplay-policy=no-user-gesture-required` flag is required : without it Chromium blocks the incoming call ringtone (no audio without a user gesture).

Also disable screen blanking on the Pi, the TV manages its own standby : `sudo raspi-config` > Display Options > Screen Blanking > No.

### Keep the HDMI output alive across TV standby

When the TV goes to standby it cuts the HDMI link: the Pi sees the display as unplugged, the compositor removes the output and the Chromium window loses keyboard focus. After the TV wakes up, the remote keys no longer reach the app (no arrow navigation, no call actions). Force the kernel to treat the HDMI output as always connected by appending this to the single line of `/boot/firmware/cmdline.txt` :

```
video=HDMI-A-1:1920x1080@60D
```

Then reboot.

> /!\ `HDMI-A-1` is the port closest to the power input, and the trailing `D` is what forces the "always connected" state. If the TV is plugged in the other port use `HDMI-A-2`, and adapt the resolution to your TV. Check which connector is in use with : `cat /sys/class/drm/card*-HDMI-A-1/status`

### Test the whole flow

Turn the TV off (standby), then start a call from any account to the room account configured on this Pi. The TV should turn on and, depending on the resident call policy, either ring with the incoming call dialog (answer with the TV remote) or join the call directly.

Then, with a non dependent resident : press any remote key while the TV is in standby (the TV should turn on), and press the back key on the home page (the TV should turn off). With a dependent resident the TV should turn off by itself a few seconds after the call ends.
