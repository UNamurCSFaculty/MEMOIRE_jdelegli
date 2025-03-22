package org.unamur.elderrings.modules.user.internal;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.infra.user.mappers.UserPreferencesEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserPreferencesRepository;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetUserPreferencesImpl implements GetUserPreferences {

    private final UserPreferencesRepository preferencesRepository;

    @Override
    public UserPreferences getPreferencesForUser(UUID userId) {
        return preferencesRepository.findByUserId(userId)
                .map(UserPreferencesEntityMapper::toModel)
                .orElseGet(() -> new UserPreferences(
                  userId,
                  new UserPreferences.GeneralPreferences("fr", false),
                  new UserPreferences.VisualPreferences(TextSize.MD, false),
                  new UserPreferences.AudioPreferences(false, List.of())
              ));
    }
}
