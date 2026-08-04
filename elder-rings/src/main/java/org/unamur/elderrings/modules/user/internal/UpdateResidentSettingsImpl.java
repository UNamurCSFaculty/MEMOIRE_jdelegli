package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.user.api.UpdateResidentSettings;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.internal.messages.UserUpdatedMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class UpdateResidentSettingsImpl implements UpdateResidentSettings {

    private final UserRepository userRepository;
    private final SendNotificationInterface sendNotification;

    @Override
    @Transactional
    public void updateAutonomyLevel(UUID residentId, Resident.AutonomyLevel level) {
        // Get the user related to the id
        var user = userRepository.getUserById(residentId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        // Check if the user is a resident
        if (!(user instanceof ResidentEntity resident)) {
            throw new BadRequestException("User is not a resident");
        }

        resident.setAutonomyLevel(ResidentEntity.AutonomyLevel.valueOf(level.name()));

        sendNotification.send(residentId, UserUpdatedMessage.builder()
                .type("USER_UPDATED")
                .value(residentId)
                .build());
    }
}