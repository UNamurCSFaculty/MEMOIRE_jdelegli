package org.unamur.elderrings.modules.telecommunication.api;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

public interface GetCallRoomInterface {
    
    CallRoom getCallRoom(CallRoomId id);

}
