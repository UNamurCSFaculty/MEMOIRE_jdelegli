import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import mainRouter from "./mainRouter.tsx";
import "./locales/i18n.ts";
import UserAuthContextProvider from "@contexts/UserAuthContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserAuthContextProvider>
      <RouterProvider router={mainRouter} />
    </UserAuthContextProvider>
  </StrictMode>
);
