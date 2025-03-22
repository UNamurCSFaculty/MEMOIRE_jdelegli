package org.unamur.elderrings.modules.user.api;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.ContactRequest;

public interface GetPendingContactRequests {

  List<ContactRequest> getPendingRequestsForUser(UUID userId);
  
}
