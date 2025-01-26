import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Carousel from "@components/Carousel";
import { basePath } from "../basepath.config";
import CallRoomPage from "@pages/CallRoomPage";
import Greetings from "@pages/Greetings";
import CreateCallRoomPage from "@pages/CreateCallRoomPage";

const mainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="contacts" element={<Carousel></Carousel>} index />
      <Route path="create-call-room" element={<CreateCallRoomPage />} />
      <Route path="call-room/:roomId" element={<CallRoomPage />} />
      <Route path="greetings" element={<Greetings />} />
    </Route>
  ),
  { basename: basePath }
);

export default mainRouter;
