import Col from "@components/layout/Col";
import Row from "@components/layout/Row";
import { ZodiosError } from "@zodios/core";
import { isAxiosError } from "axios";
import { Trans, useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { ZodError } from "zod";
import IconErrorCircleRounded from "~icons/material-symbols/error-circle-rounded";
import IconCopyToClipBoard from "~icons/tabler/copy";
import { Button } from "@heroui/button";

interface ErrorHandlerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServerResponseText(responseData: any) {
  let response = "";
  if (responseData?.message) {
    response += "\n \n Server response : \n \n" + responseData.message;
  }
  if (responseData?.correlationId) {
    response += "\n \n Server response correlation id : \n \n" + responseData.correlationId;
  }
  return response;
}

export default function ErrorHandler({ error }: Readonly<ErrorHandlerProps>) {
  const { t } = useTranslation();
  let errorName = t("Components.Errors.ErrorHandler.UnknownError");
  if (isAxiosError(error)) {
    errorName = "Axios Error";
  } else if (error instanceof ZodiosError) {
    errorName = "Zodios Error";
  } else if (error instanceof ZodError) {
    errorName = "Zod Error";
  }

  const serverResponseText = error?.response?.data
    ? getServerResponseText(error.response.data)
    : "";

  return (
    <Col className="m-2 rounded-lg border border-danger-400 bg-danger-50 p-5 text-base text-danger-700">
      <Row className="items-center gap-2">
        <IconErrorCircleRounded className="h-6 w-6" />
        <p className="text-xl font-bold">{"Components.Errors.ErrorHandler.Title"}</p>
      </Row>
      <Row className="gap-2">
        <p className="text-sm italic">{"Components.Errors.ErrorHandler.Summary"}</p>
        {error && typeof error === "object" && (
          <Col className="gap-1">
            <div className="rounded bg-danger-800/80 px-4 py-1 text-sm uppercase text-danger-100">
              {"Components.Errors.ErrorHandler.WhatHappened"}
            </div>
            <p className="pl-8 italic">{errorName}</p>
          </Col>
        )}
        <Col className="gap-1">
          <div className="rounded bg-danger-800/80 px-4 py-1 text-sm uppercase text-danger-100">
            {"Components.Errors.ErrorHandler.WhatNow"}
          </div>
          <div className="pl-8">
            <Trans i18nKey={"Components.Errors.ErrorHandler.Action"}>
              Go back to the
              <NavLink to="/" className="underline">
                home page
              </NavLink>
              .
            </Trans>
          </div>
        </Col>
        <hr className="border-danger-500" />
        <details>
          <summary>{"Components.Errors.ErrorHandler.TechnicalDetailsHeader"}</summary>
          <Row className="w-full rounded bg-danger-900/80">
            <Button
              onPress={() => navigator.clipboard.writeText(error.message + serverResponseText)}
              color="default"
              size="sm"
            >
              <IconCopyToClipBoard />
            </Button>
          </Row>
        </details>
        <pre className="flex-wrap whitespace-pre-wrap rounded px-4 pt-0 text-white">
          {error.message && error.message instanceof Object
            ? JSON.stringify(error.message, null, 2)
            : error.message}
        </pre>
        <pre className="flex-wrap whitespace-pre-wrap rounded px-4 pt-0 pb-8 text-white">
          {serverResponseText}
        </pre>
      </Row>
    </Col>
  );
}
