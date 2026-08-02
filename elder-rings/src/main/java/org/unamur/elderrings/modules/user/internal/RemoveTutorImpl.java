package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.FamilyEntity;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.RemoveTutor;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class RemoveTutorImpl implements RemoveTutor {

    private final UserRepository repository;

    @Override
    @Transactional
    public void removeTutor(UUID tutorId, UUID residentId) {
        var tutor = repository.getUserById(tutorId)
                .filter(FamilyEntity.class::isInstance)
                .map(FamilyEntity.class::cast)
                .orElseThrow(() -> new IllegalStateException("Tutor user not found"));

        if (tutor.getTutorOf() == null || !tutor.getTutorOf().getId().equals(residentId)) {
            throw new IllegalStateException("This user is not a tutor of this resident");
        }

        tutor.setTutorOf(null);
    }
}