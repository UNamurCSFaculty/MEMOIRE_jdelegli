package org.unamur.elderrings.modules.user.internal;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.infra.user.mappers.UserContactRequestEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserContactRequestRepository;
import org.unamur.elderrings.modules.user.api.GetPendingContactRequests;
import org.unamur.elderrings.modules.user.api.models.ContactRequest;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetPendingContactRequestsImpl implements GetPendingContactRequests {

    private final UserContactRequestRepository requestRepository;

    @Override
    public List<ContactRequest> getPendingRequestsForUser(UUID userId) {
        return requestRepository.findPendingRequestsForTarget(userId)
                .stream()
                .map(UserContactRequestEntityMapper::toModel)
                .toList();
    }
}
