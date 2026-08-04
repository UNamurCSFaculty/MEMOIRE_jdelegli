package org.unamur.elderrings.app.telecommunication.ws;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.JoinCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;

import io.quarkus.security.ForbiddenException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnOpenCallRoomSession {

  private final ConnectedUser user;
  private final GetCallRoomInterface getCallRoom;
  private final JoinCallRoomInterface joinCallRoom;

  public void onOpen(String roomId, Session session){
    CallRoomId callRoomId = CallRoomId.fromString(roomId);
    CallRoom callRoom = getCallRoom.getCallRoom(callRoomId);
  

    if(!callRoom.isMember(user)) {
      throw new ForbiddenException(String.format("User %s is not allowed in the room", user.getId()));
    }

    // the identity is resolved once, here, where the request context is reliable:
    // the message and close paths then read it back from the socket itself
    session.getUserProperties().put(CallRoomMember.SESSION_KEY, CallRoomMember.of(user));

    joinCallRoom.joinCallRoom(callRoomId, session);
  } 
}
