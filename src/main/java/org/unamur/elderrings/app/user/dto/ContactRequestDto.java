package org.unamur.elderrings.app.user.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContactRequestDto {

   public enum ContactRequestStatusDto {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    private UUID id;
    private UUID requesterId;
    private UUID targetId;
    private ContactRequestStatusDto status;
    private Instant createdAt;
    private Instant updatedAt;
  
}
