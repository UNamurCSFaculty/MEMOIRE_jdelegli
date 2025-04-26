package org.unamur.elderrings.modules.telecommunication.api.models;

import java.time.OffsetDateTime;
import java.time.temporal.TemporalUnit;

import jakarta.validation.constraints.NotNull;

public record CallRoomCreationDate(@NotNull OffsetDateTime creationDate) {
    
    public static CallRoomCreationDate now() {
        return new CallRoomCreationDate(OffsetDateTime.now());
    }

    public boolean isOlderThan(int amount, TemporalUnit timeUnit) {
        return creationDate.isBefore(OffsetDateTime.now().minus(amount, timeUnit));
    }
}
