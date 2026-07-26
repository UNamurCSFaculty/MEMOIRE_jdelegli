package org.unamur.elderrings.modules.user.internal;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.mappers.UserPreferencesEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserPreferencesRepository;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetUserPreferencesImpl implements GetUserPreferences {

    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserPreferences getPreferencesForUser(UUID userId) {
        return preferencesRepository.findByUserId(userId)
                .map(UserPreferencesEntityMapper::toModel)
                .orElseGet(() -> new UserPreferences(
                  userId,
                  new UserPreferences.GeneralPreferences("fr", false, false),
                  new UserPreferences.VisualPreferences(TextSize.MD, false),
                  new UserPreferences.AudioPreferences(false, List.of(), false),
                  defaultCallPolicyFor(userId)
              ));
    }

    private UserPreferences.CallPolicyPreferences defaultCallPolicyFor(UUID userId) {
        var owner = userRepository.getUserById(userId).orElse(null);
        if (!(owner instanceof ResidentEntity resident)) {
            return null;
        }
        if (resident.getAutonomyLevel() == null) {
            return new UserPreferences.CallPolicyPreferences(false, false);
        }
        return UserPreferences.CallPolicyPreferences.defaultsFor(
            Resident.AutonomyLevel.valueOf(resident.getAutonomyLevel().name()));
    }
}
