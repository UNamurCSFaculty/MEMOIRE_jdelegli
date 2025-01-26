import { apiClient } from "@openapi/zodiosClient";
import { useEffect, useState } from "react";

export default function Greetings() {
  const [response, setResponse] = useState<unknown>(null);

  useEffect(() => {
    apiClient.getElderRingsapihello().then((resp) => setResponse(resp));
  }, []);

  return <div>{response}</div>;
}
