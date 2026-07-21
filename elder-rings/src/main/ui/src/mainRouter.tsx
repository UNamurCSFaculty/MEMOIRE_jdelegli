import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { basePath } from "../basepath.config";
import CallRoomPage from "@pages/CallRoomPage";
import PageNotFound from "@pages/generic/PageNotFound";
import ErrorDisplayPage from "@pages/generic/ErrorDisplayPage";
import RootLayout from "@pages/RootLayout";
import ContactPage from "@pages/ContactPage";
import AddContactPage from "@pages/AddContactPage";
import UserPreferencePage from "@pages/UserPreferencePage";
import HomeMenu from "@pages/HomeMenu";
import StaffRoute from "@components/navigation/StaffRoute";
import ResidentsPage from "@pages/ResidentsPage";

const mainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" id="rootLayout" element={<RootLayout />} errorElement={<ErrorDisplayPage />}>
      <Route index element={<HomeMenu />} />
      <Route path="contacts" element={<ContactPage />} />
      <Route element={<StaffRoute />}>
        <Route path="residents" element={<ResidentsPage />} />
      </Route>
      <Route path="add-contact" element={<AddContactPage />} />
      <Route path="user-preferences" element={<UserPreferencePage />} />
      <Route path="call-room/:roomId" element={<CallRoomPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Route>,
  ),
  { basename: basePath },
);

export default mainRouter;
