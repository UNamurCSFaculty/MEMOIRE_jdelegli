package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.Resident;

public interface UpdateResidentSettings {
    void updateAutonomyLevel(UUID residentId, Resident.AutonomyLevel level);
}
