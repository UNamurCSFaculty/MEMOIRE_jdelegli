import fetch from "node-fetch";
import WebSocket from "ws";
import { exec } from "child_process";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function start() {
  const tokenRes = await fetch(
    "https://keycloak.local/auth/realms/elderrings/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "elderrings",
        username: "room1",
        password: "test",
        grant_type: "password",
        client_secret: "exvFhqRAZD6m0qKtszUCqN2mOxeX3SoH",
      }),
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
      rejectUnauthorized: false,
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

    // 1. Turn on the TV
    exec('echo "on 0" | cec-client -s -d 1', (err) => {
      if (err) return console.error("CEC error:", err);
      console.log("TV should be turning on...");

      // 2. Launch Chromium in kiosk mode
      const url = `https://elder-rings.local/elder-rings/api/webauthn?roomId=${message.value.roomId}`;
      exec(`chromium-browser --kiosk "${url}"`, (err) => {
        if (err) console.error("Failed to launch Chromium:", err);
      });
    });
  });
}

start();
