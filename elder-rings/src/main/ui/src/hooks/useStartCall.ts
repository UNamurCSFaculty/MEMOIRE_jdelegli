import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { notifyError } from "@utils/notifyUtil";

/**
 * Returns a startCall(contact) function: creates a call room with the
 * given contact and navigates to it. Notifies the user when the contact
 * enabled do not disturb.
 */
export function useStartCall() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const startCall = useCallback(
    (contact: ContactDto) => {
      apiClient
        .createCallRoom({ userIds: [contact.id!] })
        .then((resp) => {
          navigate("/call-room/" + resp.id);
        })
        .catch((err) => {
          const axiosError = err as AxiosError<{ errorCode: string }>;
          if (axiosError.response?.data?.errorCode === "DO_NOT_DISTURB") {
            notifyError(
              t("Common.DoNotDisturb", {
                name: `${contact.firstName} ${contact.lastName}`,
              }),
            );
          }
        });
    },
    [navigate, t],
  );

  return startCall;
}
