package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface CreateContactRequest {

  UUID createContactRequest(UUID requesterId, UUID targetId);
  
}
