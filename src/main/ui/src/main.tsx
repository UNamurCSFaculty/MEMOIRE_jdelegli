import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import mainRouter from "./mainRouter.tsx";
import "./locales/i18n.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={mainRouter} />
  </StrictMode>
);
