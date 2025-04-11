## Prerequisites

1. Install CEC utilities

```
sudo dnf install cec-utils   # Fedora
# OR
sudo apt install cec-utils   # Raspberry Pi (Debian-based)
```

2. Install node.js

```
sudo dnf install nodejs       # Fedora
# OR
sudo apt install nodejs npm   # Raspberry Pi (Debian-based)
```

3. Trust the root CA (see elder-rings project)

4. Have a chromium installed

5. Setup user / password (or a better solution would be to have a certificate for this)

6. Run the application

```
node elder-ring-client.js
```
