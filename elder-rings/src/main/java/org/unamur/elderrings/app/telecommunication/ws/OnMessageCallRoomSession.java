package org.unamur.elderrings.app.telecommunication.ws;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.BroadcastCallRoomMessageInterface;
import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import io.quarkus.security.ForbiddenException;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnMessageCallRoomSession {

  private final ConnectedUser user;
  private final GetCallRoomInterface getCallRoom;
  private final BroadcastCallRoomMessageInterface broadcastCallRoomMessage;

  public void onMessage(String roomId, String message){
    CallRoomId callRoomId = CallRoomId.fromString(roomId);
    CallRoom callRoom = getCallRoom.getCallRoom(callRoomId);

    if(!callRoom.isMember(user)) {
      throw new ForbiddenException(String.format("User %s is not in the room", user.getId()));
    }

    broadcastCallRoomMessage.broadcastMessage(callRoomId, message);
  }
  
}
