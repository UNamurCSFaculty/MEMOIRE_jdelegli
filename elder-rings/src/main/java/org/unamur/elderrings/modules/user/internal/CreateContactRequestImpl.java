package org.unamur.elderrings.modules.user.internal;

import java.util.Optional;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserContactRequestEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.repositories.UserContactRepository;
import org.unamur.elderrings.infra.user.repositories.UserContactRequestRepository;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.CreateContactRequest;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CreateContactRequestImpl implements CreateContactRequest {

    private final UserContactRequestRepository requestRepository;
    private final UserContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public UUID createContactRequest(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) {
            throw new IllegalArgumentException("Cannot create contact request to self");
        }

        Optional<UserEntity> requesterOpt = userRepository.getUserById(requesterId);
        Optional<UserEntity> targetOpt = userRepository.getUserById(targetId);

        if (requesterOpt.isEmpty() || targetOpt.isEmpty()) {
            throw new IllegalStateException("Requester or target user not found");
        }

        if (contactRepository.existsContact(requesterId, targetId)) {
            throw new IllegalStateException("Users are already contacts");
        }

        if (requestRepository.existsPendingRequestBetween(requesterId, targetId)) {
            throw new IllegalStateException("A pending request already exists between users");
        }

        UserContactRequestEntity request = new UserContactRequestEntity();
        request.setRequester(requesterOpt.get());
        request.setTarget(targetOpt.get());
        request.setStatus(UserContactRequestEntity.ContactRequestStatusEntity.PENDING);
        
        requestRepository.persist(request);
        return request.getId();
    }
}