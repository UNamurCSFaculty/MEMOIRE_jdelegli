import {
  CallRoomInvitationMessageContent,
  callRoomInvitationMessageContent,
  notificationSocketEventMessage,
} from "@type/notificationSocketEventMessage";
import { buildWsUrl } from "@utils/webSocketHelper";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import Row from "@components/layout/Row";
import { IconEndCall, IconStartCall } from "@components/icons/favouriteIcons";
import { useNavigate } from "react-router-dom";
import { ContactDto } from "@type/openapiTypes";
import { apiClient } from "@openapi/zodiosClient";
import { basePath } from "../../../basepath.config";
import { useTranslation } from "react-i18next";

export default function IncomingCallListener() {
  const [roomOffer, setRoomOffer] = useState<CallRoomInvitationMessageContent | null>(null);
  const [contact, setContact] = useState<ContactDto | null>(null);
  const { lastJsonMessage } = useWebSocket(buildWsUrl("notifications"));
  const navigate = useNavigate();

  const { t } = useTranslation();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (lastJsonMessage) {
      const parsedSocketMessage = notificationSocketEventMessage.parse(lastJsonMessage);
      if (parsedSocketMessage.type === "CALL_ROOM_INVITATION") {
        const parsedMessage = callRoomInvitationMessageContent.parse(parsedSocketMessage.value);
        setRoomOffer(parsedMessage);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (roomOffer) {
      apiClient
        .getUser({ queries: { userId: roomOffer?.userId } })
        .then((resp) => setContact(resp));
    }
  }, [roomOffer]);

  useEffect(() => {
    if (roomOffer && contact) {
      audioRef.current = new Audio(basePath + "/api/media/sounds/ringtone.wav");
      audioRef.current.loop = true;

      // Safe play attempt
      audioRef.current.play().catch((e) => {
        console.warn("[IncomingCall] Failed to play sound:", e);
      });
    }

    // Stop sound when modal is closed
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [roomOffer, contact]);

  if (roomOffer && contact) {
    return (
      <Modal isOpen={true}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("Components.IncomingCallListener.IncomingCall")}
              </ModalHeader>
              <ModalBody>
                <p className="flex flex-col items-center gap-4">
                  <img
                    src={
                      contact.picture
                        ? `data:image/*;base64,${contact.picture}`
                        : basePath + "/picture-user-default.jpg"
                    }
                    alt={t("Components.IncomingCallListener.ContactPictureAlt", {
                      name: `${contact.firstName} ${contact.lastName}`,
                    })}
                    className="w-64 object-contain"
                  />
                  {t("Components.IncomingCallListener.CallRequest", {
                    name: `${contact.firstName} ${contact.lastName}`,
                  })}
                </p>
              </ModalBody>
              <ModalFooter>
                <Row className="items-center gap-12 justify-center w-full">
                  <Button
                    color="success"
                    isIconOnly
                    onPress={() => {
                      setRoomOffer(null);
                      setContact(null);
                      navigate("call-room/" + roomOffer.roomId);
                    }}
                    size="lg"
                    aria-label={t("Components.IncomingCallListener.AcceptCall")}
                  >
                    <IconStartCall />
                  </Button>
                  <Button
                    color="danger"
                    isIconOnly
                    onPress={() => {
                      apiClient.rejectCallRoomInvitation({ roomId: roomOffer.roomId });
                      setRoomOffer(null);
                      setContact(null);
                    }}
                    size="lg"
                    aria-label={t("Components.IncomingCallListener.DeclineCall")}
                  >
                    <IconEndCall />
                  </Button>
                </Row>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  } else {
    return <></>;
  }
}
