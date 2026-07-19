import {
  CallRoomInvitationMessageContent,
  callRoomInvitationMessageContent,
  notificationSocketEventMessage,
} from "@type/notificationSocketEventMessage";
import { buildWsUrl } from "@utils/webSocketHelper";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Modal, Button } from "@heroui/react";
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
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusedIndex = useRef(0);

  const acceptCall = useCallback(() => {
    setRoomOffer(null);
    setContact(null);
    navigate("call-room/" + roomOffer?.roomId, { state: { isCallee: true } });
  }, [navigate, roomOffer]);

  const declineCall = useCallback(() => {
    if (roomOffer) apiClient.rejectCallRoomInvitation({ roomId: roomOffer.roomId });
    setRoomOffer(null);
    setContact(null);
  }, [roomOffer]);

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

  useEffect(() => {
    if (!roomOffer || !contact) return;

    focusedIndex.current = 0;
    buttonRefs.current[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        focusedIndex.current = focusedIndex.current === 0 ? 1 : 0;
        buttonRefs.current[focusedIndex.current]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [roomOffer, contact]);

  if (roomOffer && contact) {
    return (
      <Modal>
        <Modal.Backdrop isOpen={true} isDismissable={false} isKeyboardDismissDisabled>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header className="flex flex-col gap-1">
                <Modal.Heading>
                  {t("Components.IncomingCallListener.IncomingCall")}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
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
              </Modal.Body>
              <Modal.Footer>
                <Row className="items-center gap-12 justify-center w-full">
                  <Button
                    ref={(el) => { buttonRefs.current[0] = el; }}
                    variant="primary"
                    isIconOnly
                    onPress={acceptCall}
                    size="lg"
                    aria-label={t("Components.IncomingCallListener.AcceptCall")}
                  >
                    <IconStartCall />
                  </Button>
                  <Button
                    ref={(el) => { buttonRefs.current[1] = el; }}
                    variant="danger"
                    isIconOnly
                    onPress={declineCall}
                    size="lg"
                    aria-label={t("Components.IncomingCallListener.DeclineCall")}
                  >
                    <IconEndCall />
                  </Button>
                </Row>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    );
  } else {
    return <></>;
  }
}
