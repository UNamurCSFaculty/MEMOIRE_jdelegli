package org.unamur.elderrings.modules.telecommunication.api;

import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

public interface AddCallRoomMemberInterface {

    void addMember(CallRoomId roomId, UUID userId);

}