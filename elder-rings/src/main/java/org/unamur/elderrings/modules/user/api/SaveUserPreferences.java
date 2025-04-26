package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.UserPreferences;

public interface SaveUserPreferences {
  void savePreferences(UUID userId, UserPreferences preferences);
}