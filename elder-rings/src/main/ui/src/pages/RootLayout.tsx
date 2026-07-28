import Col from "@components/layout/Col";
import SoundPlayer from "@components/sounds/SoundPlayer";
import PreferencesSyncListener from "@components/userPreferences/PreferencesSyncListener";
import IncomingCallListener from "@components/webrtc/IncomingCallListener";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function RootLayout() {
  return (
    <Col className="h-screen w-screen bg-linear-to-br from-indigo-900 via-sky-800 to-blue-900 overflow-auto">
      <Outlet />
      <IncomingCallListener />
      <PreferencesSyncListener />
      <SoundPlayer />
      <ToastContainer />
    </Col>
  );
}
