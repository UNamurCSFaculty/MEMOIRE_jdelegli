package org.unamur.elderrings.modules.telecommunication.api;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import jakarta.websocket.Session;

public interface JoinCallRoomInterface {

    void joinCallRoom(CallRoomId id, Session session);
    
}
