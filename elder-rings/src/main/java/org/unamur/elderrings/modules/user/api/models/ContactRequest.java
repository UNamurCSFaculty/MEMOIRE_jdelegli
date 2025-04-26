package org.unamur.elderrings.modules.user.api.models;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContactRequest {

  public enum ContactRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
  }

  private UUID id;
  private UUID requesterId;
  private UUID targetId;
  private ContactRequestStatus status;
  private Instant createdAt;
  private Instant updatedAt;
  
}
