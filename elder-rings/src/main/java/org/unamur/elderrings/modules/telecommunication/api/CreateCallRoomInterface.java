package org.unamur.elderrings.modules.telecommunication.api;

import java.util.UUID;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;

import java.util.Set;

public interface CreateCallRoomInterface {

    CallRoom createCallRoom(Set<UUID> userIds);

}
