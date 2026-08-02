package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface RemoveTutor {
    void removeTutor(UUID familyId, UUID residentId);
}