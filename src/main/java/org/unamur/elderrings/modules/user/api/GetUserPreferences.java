package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.UserPreferences;

public interface GetUserPreferences {
  UserPreferences getPreferencesForUser(UUID userId);
}