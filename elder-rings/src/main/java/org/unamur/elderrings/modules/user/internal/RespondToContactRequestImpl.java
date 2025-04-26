package org.unamur.elderrings.modules.user.internal;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserContactRequestEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.repositories.UserContactRepository;
import org.unamur.elderrings.infra.user.repositories.UserContactRequestRepository;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.RespondToContactRequest;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class RespondToContactRequestImpl implements RespondToContactRequest {

    private final UserContactRequestRepository requestRepository;

    private final UserContactRepository contactRepository;

    private final UserRepository userRepository;

    @Transactional
    @Override
    public void respondToRequest(UUID requestId, boolean accepted) {
      Optional<UserContactRequestEntity> optionalRequest = requestRepository.getByRequestId(requestId);
      if (optionalRequest.isEmpty()) {
          throw new IllegalStateException("Request not found");
      }

      UserContactRequestEntity request = optionalRequest.get();

      if (request.getStatus() != UserContactRequestEntity.ContactRequestStatusEntity.PENDING) {
          throw new IllegalStateException("Request already handled");
      }

      if (accepted) {
          Optional<UserEntity> requesterOpt = userRepository.getUserById(request.getRequester().getId());
          Optional<UserEntity> targetOpt = userRepository.getUserById(request.getTarget().getId());

          if (requesterOpt.isEmpty() || targetOpt.isEmpty()) {
              throw new IllegalStateException("Requester or Target user not found");
          }

          contactRepository.createContact(requesterOpt.get(), targetOpt.get());
          request.setStatus(UserContactRequestEntity.ContactRequestStatusEntity.ACCEPTED);
      } else {
          request.setStatus(UserContactRequestEntity.ContactRequestStatusEntity.REJECTED);
      }

      request.setUpdatedAt(Instant.now());
  }
}