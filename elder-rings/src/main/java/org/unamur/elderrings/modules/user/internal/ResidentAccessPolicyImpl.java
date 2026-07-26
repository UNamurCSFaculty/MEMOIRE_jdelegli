package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.GetUser;
import org.unamur.elderrings.modules.user.api.ResidentAccessPolicy;
import org.unamur.elderrings.modules.user.api.models.Family;
import org.unamur.elderrings.modules.user.api.models.UserType;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class ResidentAccessPolicyImpl implements ResidentAccessPolicy {

    private final ConnectedUser connectedUser;
    private final GetUser getUser;

    @Override
    public boolean canManage(UUID residentId) {
        if (connectedUser.getUserType() == UserType.STAFF) {
            return true;
        }
        var caller = getUser.getUser(connectedUser.getId()).getUser();
        return caller instanceof Family family && residentId.equals(family.getTutorOfResidentId());
    }
}