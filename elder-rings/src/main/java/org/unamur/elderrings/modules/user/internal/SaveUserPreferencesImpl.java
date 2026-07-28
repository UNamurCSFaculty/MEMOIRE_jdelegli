package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.mappers.UserPreferencesEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserPreferencesRepository;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.SaveUserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.user.internal.messages.PreferencesUpdatedMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class SaveUserPreferencesImpl implements SaveUserPreferences {

    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final SendNotificationInterface sendNotification;

    @Override
    @Transactional
    public void savePreferences(UUID userId, UserPreferences preferences) {
        var user = userRepository.getUserById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        var existing = preferencesRepository.findByUserId(userId);

        if (existing.isPresent()) {
            var entity = UserPreferencesEntityMapper.toEntity(preferences, user);
            entity.setId(existing.get().getId());
            preferencesRepository.getEntityManager().merge(entity);
        } else {
            var entity = UserPreferencesEntityMapper.toEntity(preferences, user);
            preferencesRepository.persist(entity);
        }

        sendNotification.send(userId,
                PreferencesUpdatedMessage.builder().type("PREFERENCES_UPDATED").value(userId).build());
    }
}