import { useEffect, useRef } from "react";
import { useToggleDnd } from "../../hooks/useToggleDnd";
import { useUser } from "../../hooks/useUser";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@openapi/zodiosClient";

export const REMOTE_BUTTON_EVENT = "remote-button";
const WAKE_THROTTLE_MS = 30_000;
// This mapping should be reconsidered with a better remote control, but for now it is a good starting point for the current remote
const KEYBOARD_ACTIONS: Record<string, string> = {
  Backspace: "TOGGLE_DND",
  PageUp: "TOGGLE_CAMERA", // Use this button to turn off the TV when not in a call
  PageDown: "TOGGLE_MIC",
  ContextMenu: "GO_HOME",
  Escape: "END_CALL", // Doesn't work (considered as back button by the pi)
};

export default function RemoteButtonListener() {
  const navigate = useNavigate();
  const user = useUser();
  const toggleDnd = useToggleDnd();
  const location = useLocation();
  const lastWakeRef = useRef(0);

  useEffect(() => {
    // the remote only exists in the rooms: staff and tutor browsers must
    // keep their ordinary keyboard behavior
    if (user.userType !== "RESIDENT") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const action = KEYBOARD_ACTIONS[e.key];
      const inCall = location.pathname.includes("call-room");

      // TV control: everything is automatic for dependent residents
      if (user.autonomyLevel !== "DEPENDENT") {
        if (action === "TOGGLE_CAMERA" && !inCall) {
          e.preventDefault();
          apiClient.setTvPower({ on: false }).catch(() => {});
          return;
        }
        // any other key wakes the TV, at most once per throttle window
        const now = Date.now();
        if (now - lastWakeRef.current > WAKE_THROTTLE_MS) {
          lastWakeRef.current = now;
          apiClient.setTvPower({ on: true }).catch(() => {});
        }
      }

      if (!action) return;

      e.preventDefault();
      if (action === "TOGGLE_DND") {
        if (user.autonomyLevel === "DEPENDENT") return;
        toggleDnd();
      } else if (action === "GO_HOME") {
        navigate("/");
      } else {
        window.dispatchEvent(new CustomEvent(REMOTE_BUTTON_EVENT, { detail: action }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [user.userType, toggleDnd, navigate, user.autonomyLevel, location.pathname]);

  return null;
}
