import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { apiClient } from "@openapi/zodiosClient";
import { ContactRequestDto } from "@type/openapiTypes";

interface ContactRequestModalProps {
  requests: ContactRequestDto[];
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
        <ModalHeader>Vous avez une ou plusieurs demandes de contact</ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            {requests.map((req) => (
              <div className="flex justify-center gap-4" key={req.id}>
                <p>{req.requesterId}</p>
                <p>{req.createdAt}</p>
                <div className="flex gap-2 justify-center ml-auto">
                  <Button
                    onPress={() => {
                      respondToContactRequest(req.id!, true);
                    }}
                    color="success"
                  >
                    Accepter
                  </Button>
                  <Button
                    onPress={() => {
                      respondToContactRequest(req.id!, false);
                    }}
                    color="danger"
                  >
                    Refuser
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
