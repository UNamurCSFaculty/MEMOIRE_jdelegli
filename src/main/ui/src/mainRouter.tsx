import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { basePath } from "../basepath.config";
import CallRoomPage from "@pages/CallRoomPage";
import PageNotFound from "@pages/generic/PageNotFound";
import ErrorDisplayPage from "@pages/generic/ErrorDisplayPage";
import RootLayout from "@pages/RootLayout";
import ContactPage from "@pages/ContactPage";
import SetUserProfile from "@pages/SetUserProfile";
import AddContactPage from "@pages/AddContactPage";

const mainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" id="rootLayout" element={<RootLayout />} errorElement={<ErrorDisplayPage />}>
      <Route index element={<ContactPage />} />
      <Route path="contacts" element={<ContactPage />} />
      <Route path="add-contact" element={<AddContactPage />} />
      <Route path="call-room/:roomId" element={<CallRoomPage />} />
      <Route path="change-picture" element={<SetUserProfile />} />

      <Route path="*" element={<PageNotFound />} />
    </Route>
  ),
  { basename: basePath }
);

export default mainRouter;
