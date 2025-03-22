package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface RespondToContactRequest {

  void respondToRequest(UUID requestId, boolean accepted);
  
}
