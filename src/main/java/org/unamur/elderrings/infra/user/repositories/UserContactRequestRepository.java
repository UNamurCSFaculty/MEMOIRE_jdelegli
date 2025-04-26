package org.unamur.elderrings.infra.user.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserContactRequestEntity;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserContactRequestRepository implements PanacheRepository<UserContactRequestEntity> {

  // Get user by id
  public Optional<UserContactRequestEntity> getByRequestId(UUID id) {
    return find("id", id).firstResultOptional();  // Panache's findById() returns null if not found
  }

  public boolean existsPendingRequestBetween(UUID userId1, UUID userId2) {
    return count("status = ?1 AND ((requester.id = ?2 AND target.id = ?3) OR (requester.id = ?3 AND target.id = ?2))",
        UserContactRequestEntity.ContactRequestStatusEntity.PENDING, userId1, userId2) > 0;
  }

  public List<UserContactRequestEntity> findPendingRequestsForTarget(UUID targetUserId) {
    return list("status = ?1 AND target.id = ?2",
      UserContactRequestEntity.ContactRequestStatusEntity.PENDING, targetUserId);
  }

  public Optional<UserContactRequestEntity> findByRequesterAndTarget(UUID requesterId, UUID targetId) {
    return find("requester.id = ?1 AND target.id = ?2", requesterId, targetId).firstResultOptional();
  }
}
