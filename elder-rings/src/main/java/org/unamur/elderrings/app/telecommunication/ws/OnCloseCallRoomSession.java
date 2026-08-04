package org.unamur.elderrings.app.telecommunication.ws;

import org.unamur.elderrings.modules.telecommunication.api.LeaveCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnCloseCallRoomSession {

  private final LeaveCallRoomInterface leaveCallRoom;

  /**
   * Closing a socket must always clean the room up, so nothing is checked again
   * here: the membership was verified when the session was opened and the
   * identity travels with the session itself.
   */
  public void onClose(String roomId, Session session){
    leaveCallRoom.leaveCallRoom(CallRoomId.fromString(roomId), session);
  }

}
