import { useEffect } from "react";
import { useToggleDnd } from "../../hooks/useToggleDnd";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";

export const REMOTE_BUTTON_EVENT = "remote-button";

const KEYBOARD_ACTIONS: Record<string, string> = {
  Backspace: "TOGGLE_DND",
  PageUp: "TOGGLE_CAMERA",
  PageDown: "TOGGLE_MIC",
  ContextMenu: "GO_HOME",
  // back button of the remote: adjust with the value logged by the console
  Escape: "END_CALL",
};

export default function RemoteButtonListener() {
  const navigate = useNavigate();
  const user = useUser();
  const toggleDnd = useToggleDnd();

  useEffect(() => {
    // the remote only exists in the rooms: staff and tutor browsers must
    // keep their ordinary keyboard behavior
    if (user.userType !== "RESIDENT") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const action = KEYBOARD_ACTIONS[e.key];
      if (!action) return;

      e.preventDefault();
      if (action === "TOGGLE_DND") {
        toggleDnd();
      } else if (action === "GO_HOME") {
        navigate("/");
      } else {
        window.dispatchEvent(new CustomEvent(REMOTE_BUTTON_EVENT, { detail: action }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [user.userType, toggleDnd, navigate]);

  return null;
}
