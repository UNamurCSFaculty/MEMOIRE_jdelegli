import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Carousel from "@components/Carousel";
import { basePath } from "../basepath.config";

const mainRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Carousel></Carousel>}></Route>
  ),
  { basename: basePath }
);

export default mainRouter;
