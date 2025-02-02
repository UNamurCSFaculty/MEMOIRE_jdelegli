import ErrorHandler from "@components/errors/ErrorHandler";
import Col from "@components/layout/Col";
import { useAsyncError, useRouteError } from "react-router-dom";

export default function ErrorDisplayPage() {
  // this catch the router errors
  const routerError = useRouteError();
  // this catch action / loader errors from router
  const asyncError = useAsyncError();
  let error;
  // priority to the router error
  if (routerError !== undefined) {
    error = routerError;
  } else if (asyncError !== undefined) {
    error = asyncError;
  }
  return (
    <Col className="justify-center h-full w-full bg-white">
      <ErrorHandler error={error} />
    </Col>
  );
}
