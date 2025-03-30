package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;

public interface CallRoomRepository {

    Optional<CallRoom> findById(CallRoomId id);
    
    CallRoom create(Set<CallRoomMember> members);

    void delete(CallRoomId id);

    void markRejectedBy(CallRoomId id, CallRoomMember rejectedBy);
}
