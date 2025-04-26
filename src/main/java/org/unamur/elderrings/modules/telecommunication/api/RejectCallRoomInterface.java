package org.unamur.elderrings.modules.telecommunication.api;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

public interface RejectCallRoomInterface {

    void markRejectedBy(CallRoomId id);
    
}
