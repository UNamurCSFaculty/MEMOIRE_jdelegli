# Elders rings

This repository contains the main components of the elder-rings server application :

- A keycloak server, to handle authentication (with its own postgre database)
- A quarkus app server, to provide the REST API of the application
- A postregre database to store the application data
- A react application, the frontend application (served by quarkus server with Quinoa)

## Prerequisites

- A docker environement (e.g : Docker desktop)
- Java / Maven (version 21 or higher)
- Node js (version 18 or higher)

## How to run it

Start by setting up the application dependencies to run

```
cd plateform
docker compose up -d
```

This will create an empty database, a keycloak and its database

> /!\ At this point, the keycloak configuration is not part of the build, so you need to create realms, roles and user manually
> This will be included once the configuration is finished

Then you can simply run the backend and frontend by running

```
./dev.ps1
```

If you are not running on windows, you can either make your own script, or use the base command

```
.\mvnw clean compile quarkus:dev
```

## How to use the application

1. Set up keycloak and create users (not documented as it will be automated)
2. Open a browser and go to http://127.0.0.1:8080/elder-rings/

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
