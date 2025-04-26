import { toast } from "react-toastify";

export function notifyWarning(message: string) {
  toast(message, { type: "warning" });
}

export function notifySuccess(message: string) {
  toast(message, { type: "success" });
}

export function notifyError(message: string) {
  toast(message, { type: "error" });
}
