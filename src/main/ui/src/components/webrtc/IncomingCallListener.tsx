import {
  CallRoomInvitationMessageContent,
  callRoomInvitationMessageContent,
  notificationSocketEventMessage,
} from "@type/notificationSocketEventMessage";
import { buildWsUrl } from "@utils/webSocketHelper";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import Row from "@components/layout/Row";
import { IconEndCall, IconStartCall } from "@components/icons/favouriteIcons";
import { useNavigate } from "react-router-dom";

export default function IncomingCallListener() {
  const [roomOffer, setRoomOffer] = useState<CallRoomInvitationMessageContent | null>(null);
  const { lastJsonMessage } = useWebSocket(buildWsUrl("notifications"));
  const navigate = useNavigate();

  useEffect(() => {
    if (lastJsonMessage) {
      const parsedSocketMessage = notificationSocketEventMessage.parse(lastJsonMessage);
      if (parsedSocketMessage.type === "CALL_ROOM_INVITATION") {
        const parsedMessage = callRoomInvitationMessageContent.parse(parsedSocketMessage.value);
        setRoomOffer(parsedMessage);
      }
    }
  }, [lastJsonMessage]);

  if (roomOffer) {
    return (
      <Modal isOpen={true}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Appel entrant</ModalHeader>
              <ModalBody>
                <p>le user {roomOffer.userId} essaie de vous appeller</p>
              </ModalBody>
              <ModalFooter>
                <Row className="items-center gap-12 justify-center w-full">
                  <Button
                    color="success"
                    isIconOnly
                    onPress={() => {
                      setRoomOffer(null);
                      navigate("call-room/" + roomOffer.roomId);
                    }}
                    size="lg"
                  >
                    <IconStartCall />
                  </Button>
                  <Button
                    color="danger"
                    isIconOnly
                    onPress={() => {
                      setRoomOffer(null);
                    }}
                    size="lg"
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
