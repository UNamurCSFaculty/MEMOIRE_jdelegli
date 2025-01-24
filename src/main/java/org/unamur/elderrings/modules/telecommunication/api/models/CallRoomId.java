package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CallRoomId(@NotNull UUID value) {

    public static CallRoomId generateCallRoomId(){
        return new CallRoomId(UUID.randomUUID());
    }

    public static CallRoomId fromString(String value){
        return new CallRoomId(UUID.fromString(value));
    }
    
}
