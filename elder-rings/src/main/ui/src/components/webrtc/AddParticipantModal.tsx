import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { Modal } from "@heroui/react";

import { apiClient } from "@openapi/zodiosClient";
import { AddableUsersDto, ContactDto } from "@type/openapiTypes";
import { IconAdd } from "@components/icons/favouriteIcons";
import UserRow from "@components/users/UserRow";
import { notifyError, notifySuccess } from "@utils/notifyUtil";

interface AddParticipantModalProps {
  roomId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type LoadingStatus = "loading" | "ready" | "error";

/**
 * Who may be brought into the call is decided by the server, which also says
 * why each person is reachable: the list is shown in those groups so it stays
 * readable when a staff member sees their colleagues and the relatives of a
 * resident at the same time. The invitee then joins through the ordinary
 * incoming call flow.
 */
export default function AddParticipantModal({
  roomId,
  isOpen,
  onOpenChange,
}: Readonly<AddParticipantModalProps>) {
  const { t } = useTranslation();
  const [addable, setAddable] = useState<AddableUsersDto | null>(null);
  const [status, setStatus] = useState<LoadingStatus>("loading");

  useEffect(() => {
    if (!isOpen) {
      // reopening must not show the list of the previous time
      setAddable(null);
      setStatus("loading");
      return;
    }

    let ignore = false;
    apiClient
      .getAddableCallRoomUsers({ queries: { roomId } })
      .then((users) => {
        if (ignore) return;
        setAddable(users);
        setStatus("ready");
      })
      .catch(() => {
        // a refusal or a network error must not read as "nobody to add"
        if (ignore) return;
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, roomId]);

  const groups = [
    { key: "OwnContacts", contacts: addable?.ownContacts ?? [] },
    { key: "Colleagues", contacts: addable?.colleagues ?? [] },
    { key: "ResidentContacts", contacts: addable?.residentContacts ?? [] },
  ].filter((group) => group.contacts.length > 0);

  function forget(contactId: string) {
    setAddable((current) =>
      current
        ? {
            ownContacts: (current.ownContacts ?? []).filter((c) => c.id !== contactId),
            colleagues: (current.colleagues ?? []).filter((c) => c.id !== contactId),
            residentContacts: (current.residentContacts ?? []).filter((c) => c.id !== contactId),
          }
        : current,
    );
  }

  function addParticipant(contact: ContactDto) {
    const name = `${contact.firstName} ${contact.lastName}`;
    apiClient
      .addCallRoomMember({ roomId, userId: contact.id! })
      .then(() => {
        // the tile shows up on its own once the invitee joins
        forget(contact.id!);
        notifySuccess(t("Components.AddParticipantModal.Invited", { name }));
      })
      .catch((err) => {
        const axiosError = err as AxiosError<{ errorCode: string }>;
        if (axiosError.response?.data?.errorCode === "DO_NOT_DISTURB") {
          notifyError(t("Common.DoNotDisturb", { name }));
        } else {
          notifyError(t("Components.AddParticipantModal.Failed"));
        }
      });
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("Components.AddParticipantModal.Title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                {status === "loading" && <p>{t("Common.LoadingSuspension")}</p>}
                {status === "error" && <p>{t("Components.AddParticipantModal.LoadFailed")}</p>}
                {status === "ready" && groups.length === 0 && (
                  <p>{t("Components.AddParticipantModal.NoCandidate")}</p>
                )}
                {status === "ready" &&
                  groups.map((group) => (
                    <div key={group.key} className="flex flex-col gap-2">
                      <p className="font-semibold text-slate-700">
                        {t(`Components.AddParticipantModal.${group.key}`)}
                      </p>
                      {group.contacts.map((contact) => (
                        <UserRow
                          key={contact.id}
                          user={contact}
                          actions={[
                            {
                              label: t("Components.AddParticipantModal.Add", {
                                name: `${contact.firstName} ${contact.lastName}`,
                              }),
                              icon: <IconAdd />,
                              variant: "primary",
                              onClick: () => addParticipant(contact),
                            },
                          ]}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
