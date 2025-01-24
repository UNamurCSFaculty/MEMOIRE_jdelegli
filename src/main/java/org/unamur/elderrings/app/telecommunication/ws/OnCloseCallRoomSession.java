package org.unamur.elderrings.app.telecommunication.ws;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.LeaveCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import io.quarkus.security.ForbiddenException;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class OnCloseCallRoomSession {

  private final ConnectedUser user;
  private final GetCallRoomInterface getCallRoom;
  private final LeaveCallRoomInterface leaveCallRoom;

  public void onClose(String roomId){
    CallRoomId callRoomId = CallRoomId.fromString(roomId);
    CallRoom callRoom = getCallRoom.getCallRoom(callRoomId);

    if(!callRoom.isMember(user)) {
      throw new ForbiddenException(String.format("User %s is not in the room", user.getId()));
    }

    leaveCallRoom.leaveCallRoom(callRoomId);
  }
  
}
