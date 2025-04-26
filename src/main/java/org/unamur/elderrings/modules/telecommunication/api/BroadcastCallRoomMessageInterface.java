package org.unamur.elderrings.modules.telecommunication.api;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

public interface BroadcastCallRoomMessageInterface {

    void broadcastMessage(CallRoomId id, String message);
    
}
