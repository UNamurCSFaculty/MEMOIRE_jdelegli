import Col from "@components/layout/Col";
import IncomingCallListener from "@components/webrtc/IncomingCallListener";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <Col className="w-screen h-screen overflow-auto">
      <Outlet />
      <IncomingCallListener />
    </Col>
  );
}
