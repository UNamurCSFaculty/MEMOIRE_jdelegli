import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto, ContactRequestDto } from "@type/openapiTypes";
import { basePath } from "../../../basepath.config";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

export type ContactRequestWithUser = {
  request: ContactRequestDto;
  requester: ContactDto;
};

interface ContactRequestModalProps {
  requests: ContactRequestWithUser[];
  removeRequest: (requestId: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ContactRequestModal({
  isOpen,
  onOpenChange,
  removeRequest,
  requests,
}: Readonly<ContactRequestModalProps>) {
  const { t } = useTranslation();

  function respondToContactRequest(requestId: string, accept: boolean) {
    apiClient
      .respondToContactRequest(undefined, {
        queries: {
          accepted: accept,
        },
        params: {
          requestId: requestId,
        },
      })
      .then(() => removeRequest(requestId));
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
      <ModalContent>
        <ModalHeader>{t("Components.ContactRequestModal.Title")}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            {requests.map((req) => (
              <div className="flex justify-center items-center gap-4" key={req.request.id}>
                <p className="flex flex-col items-center gap-4">
                  <img
                    src={
                      req.requester.picture
                        ? `data:image/*;base64,${req.requester.picture}`
                        : basePath + "/picture-user-default.jpg"
                    }
                    alt={t("Components.ContactRequestModal.ContactPictureAlt", {
                      name: `${req.requester.firstName} ${req.requester.lastName}`,
                    })}
                    className="w-32 object-contain"
                  />
                </p>
                <p>{req.requester.firstName}</p>
                <p>{req.requester.lastName}</p>
                <p>{format(parseISO(req.request.createdAt!), "PPPPp")}</p>
                <div className="flex gap-2 justify-center ml-auto">
                  <Button
                    onPress={() => {
                      respondToContactRequest(req.request.id!, true);
                    }}
                    color="success"
                  >
                    {t("Components.ContactRequestModal.Accept")}
                  </Button>
                  <Button
                    onPress={() => {
                      respondToContactRequest(req.request.id!, false);
                    }}
                    color="danger"
                  >
                    {t("Components.ContactRequestModal.Decline")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
