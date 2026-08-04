package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;

import jakarta.validation.constraints.NotNull;
import jakarta.websocket.Session;

public record CallRoomMember(@NotNull UUID userId) {

    /**
     * Key under which the member owning a call room session is stored in the
     * session properties, so that the message and close paths can read the
     * identity from the socket itself instead of the request context.
     */
    public static final String SESSION_KEY = "callRoomMember";

    public static CallRoomMember of (ConnectedUser user) {
      return new CallRoomMember(user.getId());
    }

    public static CallRoomMember of (Session session) {
      return (CallRoomMember) session.getUserProperties().get(SESSION_KEY);
    }

}
