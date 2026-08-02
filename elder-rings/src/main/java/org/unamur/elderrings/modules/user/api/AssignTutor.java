package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface AssignTutor {
    void assignTutor(UUID familyId, UUID residentId);
}