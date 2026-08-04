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
const HEARTBEAT_INTERVAL_MS = 30_000;

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
    },
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

function turnOffTv() {
  exec('echo "standby 0" | cec-client -s -d 1', (err) => {
    if (err) return console.error("CEC error:", err);
    console.log("TV should be turning off...");
  });
}

async function fetchCurrentUser(token) {
  const res = await fetch("https://elder-rings.local/elder-rings/api/user/me", {
    headers: { Authorization: "Bearer " + token },
    agent: httpsAgent,
  });
  if (!res.ok) {
    throw new Error("GET /me failed with status " + res.status);
  }
  return await res.json();
}

let standbyTimer = null;

function scheduleStandby(delayMs) {
  if (standbyTimer) clearTimeout(standbyTimer);
  standbyTimer = setTimeout(() => {
    standbyTimer = null;
    turnOffTv();
  }, delayMs);
}

function cancelStandby() {
  if (standbyTimer) {
    clearTimeout(standbyTimer);
    standbyTimer = null;
  }
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
    },
  );

  let isAlive = true;
  let heartbeat = null;

  ws.on("open", () => {
    console.log("Connected to WebSocket");
    // detect half-open connections (e.g. wifi drop): without a pong
    // between two pings, the connection is considered dead
    heartbeat = setInterval(() => {
      if (!isAlive) {
        console.log("No pong received, terminating stale connection...");
        ws.terminate(); // fires "close", which schedules the reconnection
        return;
      }
      isAlive = false;
      ws.ping();
    }, HEARTBEAT_INTERVAL_MS);
  });

  ws.on("pong", () => {
    isAlive = true;
  });

  ws.on("message", async (data) => {
    let message;

    try {
      message = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON:", data.toString());
      return;
    }

    switch (message.type) {
      case "CALL_ROOM_INVITATION":
        console.log("Received CALL_ROOM_INVITATION from", message.value.userId);
        cancelStandby();
        turnOnTv();
        break;

      case "CALL_ROOM_USER_LEFT":
        console.log("Received CALL_ROOM_USER_LEFT");
        try {
          // the connection token is short-lived: fetch a fresh one
          const user = await fetchCurrentUser(await fetchToken());
          if (user.autonomyLevel === "DEPENDENT") {
            scheduleStandby(10_000);
          } else {
            console.log("User is not dependent, not turning off TV.");
          }
        } catch (err) {
          console.error("Could not check autonomy level:", err.message);
        }
        break;

      case "TV_POWER":
        cancelStandby();
        if (message.value === true) {
          turnOnTv();
        } else {
          turnOffTv();
        }
        break;

      default:
        console.log("Ignoring message:", message.type);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });

  // "close" always follows "error", so reconnection is scheduled here only
  ws.on("close", () => {
    if (heartbeat) clearInterval(heartbeat);
    console.log(
      `WebSocket closed, reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`,
    );
    setTimeout(connect, RECONNECT_DELAY_MS);
  });
}

connect();
