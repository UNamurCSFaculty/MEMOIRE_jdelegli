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

const RECONNECT_DELAY_MS = 5000;

// HTTPS agent that presents the Pi's X.509 client certificate
const httpsAgent = new https.Agent({ cert, key, ca });

async function fetchToken() {
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

  if (!tokenData.access_token) {
    throw new Error("Authentication failed: " + JSON.stringify(tokenData));
  }

  return tokenData.access_token;
}

function turnOnTv() {
  exec('echo "on 0" | cec-client -s -d 1', (err) => {
    if (err) return console.error("CEC error:", err);
    console.log("TV should be turning on...");
  });
}

async function connect() {
  let token;

  // Access tokens are short-lived: fetch a fresh one on every attempt
  try {
    token = await fetchToken();
  } catch (err) {
    console.error(err.message);
    setTimeout(connect, RECONNECT_DELAY_MS);
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

    // The kiosk browser (running permanently) handles the whole call flow:
    // incoming call dialog, call policy, WebRTC. This daemon only wakes
    // the TV up through HDMI-CEC.
    turnOnTv();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });

  // "close" always follows "error", so reconnection is scheduled here only
  ws.on("close", () => {
    console.log(`WebSocket closed, reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
    setTimeout(connect, RECONNECT_DELAY_MS);
  });
}

connect();
