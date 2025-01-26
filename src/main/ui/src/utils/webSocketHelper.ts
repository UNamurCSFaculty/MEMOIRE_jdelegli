import { basePath } from "../../basepath.config";

type SocketNameEnum = "notifications" | "call-room";

export function buildWsUrl(socketName: SocketNameEnum, params?: string) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.port
    ? window.location.hostname + ":" + window.location.port
    : window.location.hostname;
  const path = basePath;
  let baseSocketUrl = `${protocol}://${host}${path}/ws/${socketName}`;
  if (params) {
    baseSocketUrl = baseSocketUrl + `/${params}`;
  }
  return baseSocketUrl;
}
