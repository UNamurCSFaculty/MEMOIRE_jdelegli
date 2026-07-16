import fetch from "node-fetch";
import WebSocket from "ws";
import { exec } from "child_process";
import https from "https";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cert = readFileSync(join(__dirname, "certs/room1.crt"));
const key = readFileSync(join(__dirname, "certs/room1.key"));
const ca = readFileSync(join(__dirname, "certs/rootCA.crt"));

// HTTPS agent that presents the Pi's X.509 client certificate
const httpsAgent = new https.Agent({ cert, key, ca });

async function start() {
  const tokenRes = await fetch(
    "https://keycloak.local/auth/realms/elderrings/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "elderrings-pi",
        client_secret: "piSecretElderRings2024xK9mQzR",
        grant_type: "password",
      }),
      agent: httpsAgent,
    }
  );

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  if (!token) {
    console.error("Authentication failed:", tokenData);
    return;
  }

  console.log("Authenticated. Connecting to WebSocket...");

  const ws = new WebSocket(
    "wss://elder-rings.local/elder-rings/ws/notifications",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cert,
      key,
      ca,
      rejectUnauthorized: true,
    }
  );

  ws.on("open", () => {
    console.log("Connected to WebSocket");
  });

  ws.on("message", (data) => {
    let message;

    try {
      message = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON:", data.toString());
      return;
    }

    if (message.type !== "CALL_ROOM_INVITATION") {
      console.log("Ignoring message:", message.type);
      return;
    }

    console.log("Received CALL_ROOM_INVITATION from", message.value.userId);

    const url = `https://elder-rings.local/elder-rings/api/room-login?roomId=${message.value.roomId}`;

    // 1. Turn on the TV via HDMI-CEC
    exec('echo "on 0" | cec-client -s -d 1', (err) => {
      if (err) return console.error("CEC error:", err);
      console.log("TV should be turning on...");

      // 2. Launch Chromium in kiosk mode
      exec(`chromium --kiosk "${url}"`, (err) => {
        if (err) console.error("Failed to launch Chromium:", err);
      });
    });
  });
}

start();
