# Elders rings

This repository contains the main components of the elder-rings server application :

- A keycloak server, to handle authentication (with its own postgre database)
- A quarkus app server, to provide the REST API of the application
- A postregre database to store the application data
- A react application, the frontend application (served by quarkus server with Quinoa)
- A proxy to serve the application in HTTPS (optional)

## Prerequisites

- A docker environement (e.g : Docker desktop)
- Java / Maven (version 21 or higher)
- Node js (version 18 or higher)

## How to run it

### Default : HTTPS

> In order to allow webauthn authentication protocol, the default installation use HTTPS and thus require a bit of setup

1. Edit you host file on your machine

On windows : `C:\Windows\System32\drivers\etc` and on linux `/etc/hosts`

Add the following lines

```
# Domain names for elder-rings app https
127.0.0.1 elder-rings.local
127.0.0.1 keycloak.local
```

2. Trust the Root CA

On windows, double click on `/platform/nginx/certs/rootCA.crt` and install it in the `Root Authority CA` store

3. Start the dependencies and the application

Start by setting up the application dependencies to run

```
cd plateform
docker compose up -d
```

This will create an empty database, a keycloak and its database and a nginx proxy (for https)

> The keycloak created contains the basic realm configuration
> and 3 users : test_user, test_user2, room1
> All their password are "test"

Then you can simply run the backend and frontend by running

```
./dev.ps1
```

If you are not running on windows, you can either make your own script, or use the base command

```
.\mvnw clean compile quarkus:dev
```

### Using HTTP

The procedure is similar to the previous one. You can simply bypass the two first steps.

You should use the `docker-compose-http.yml` instead of the default `docker-compose.yml` for the third step

And you need to launch the application with `application-http.yml` instead of the default `application.yml` for the fourth step

## How to use the application

1. Open a browser and go to https://elder-rings.local/elder-rings/ (if you're using http, use http://127.0.0.1:8080/elder-rings/)
2. If changes are required on keycloak, go to https://keycloak.local/auth/admin/master/console (if you're using http, use http://127.0.0.1:8180/auth/admin/master/console/) and enter admin credentials (from the docker-compose file under /platform)

> /!\ Changing the keycloak configuration might require some change on the application as well !

## Functionnalities

- [x] Video call
  - [x] Screen sharing
  - [x] Basic commands (mute, hide camera, ...)
  - [x] Transcript
  - [x] Audio filters
  - [x] Remote compatible (keyboard navigation)
- [x] Contact management
  - [x] Direct (self) management
- [x] User Preference
  - [x] General
    - [x] Picture
    - [x] Lang
      - [ ] Do all translations
    - [x] Public
      - [x] filter on this for getAllUsers
    - [x] Text to speech
  - [x] Audio
    - [x] Frequency filters
    - [x] Noise filter
  - [x] Visual
    - [x] Text size (element size ?)
    - [x] Read text on screen ?
    - [x] Implements frontend to use it
- [x] Home page
  - [x] Sounds
  - [x] Sounds preference
- [x] Add contact improvement
  - [x] popup
- [x] User setting improvement
  - [x] Upload picture
- [x] Incoming call improvement
  - [x] Pop up
  - [x] Sound
- [x] Sound route media backend
- [x] Call rejection
- [ ] Contact online (implies knowing which user is online or not)
- [ ] Décrochage auto
- [ ] Role management
- [ ] Delegation management
- [ ] Audit

## Technical procedures

These procedure have already be done but are logged in case somebody want to change it

### Generating certificate with mkcert

1. Install mkcert (example for a unix env)

```
sudo apt install libnss3-tools
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install mkcert
echo >> /home/$(whoami)/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/$(whoami)/.bashrc
brew install mkcert
```

2. Generate certificates

```
cd $(ELDER_RING_REPO)
mkcert -install
mkcert elder-rings.local
mkcert keycloak.local
```

> Note `mkcert -install` will generate a new CA that you will need to install to make it work (see section `How to run it` under the `HTTPS` section)

3. Copy the generated certificats under `platform/nginx/certs` to use them

### Updating keycloak config in this repo

1. Do the changes on the keycloak admin interface, then launch the following commands :

```
docker exec keycloak  /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/export --users realm_file
docker cp keycloak:/opt/keycloak/data/export .\platform\keycloak-config
```

2. Commit your changes so next time somebody will mount a new docker instance, they will have the changes

### Useful links (will be removed)

https://keycloak.local/auth/admin/master/console
https://elder-rings.local/elder-rings/
https://elder-rings.local/elder-rings/api/webauthn
