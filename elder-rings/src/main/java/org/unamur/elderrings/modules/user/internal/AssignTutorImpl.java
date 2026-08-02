package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.FamilyEntity;
import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.AssignTutor;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class AssignTutorImpl implements AssignTutor {

    private final UserRepository repository;

    @Override
    @Transactional
    public void assignTutor(UUID tutorId, UUID residentId) {
        var tutor = repository.getUserById(tutorId)
                .filter(FamilyEntity.class::isInstance)
                .map(FamilyEntity.class::cast)
                .orElseThrow(() -> new IllegalStateException("Tutor user not found"));
        var resident = repository.getUserById(residentId)
                .filter(ResidentEntity.class::isInstance)
                .map(ResidentEntity.class::cast)
                .orElseThrow(() -> new IllegalStateException("Resident not found"));

        if (tutor.getTutorOf() != null) {
            throw new IllegalStateException("This user is already the tutor of a resident");
        }

        tutor.setTutorOf(resident);
    }
}