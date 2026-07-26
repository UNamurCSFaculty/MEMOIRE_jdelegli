package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface ResidentAccessPolicy {

    /**
     * A resident's settings can be managed by any staff member,
     * or by a family member who is the resident's tutor.
     */
    boolean canManage(UUID residentId);
}