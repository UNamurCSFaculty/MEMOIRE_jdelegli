package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;

import jakarta.validation.constraints.NotNull;

public record CallRoomMember(@NotNull UUID userId) {

    public static CallRoomMember of (ConnectedUser user) {
      return new CallRoomMember(user.getId());
    }
    
}
