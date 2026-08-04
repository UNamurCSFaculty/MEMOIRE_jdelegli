package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.telecommunication.api.SetTvPowerInterface;
import org.unamur.elderrings.modules.telecommunication.internal.messages.TvPowerMessage;
import org.unamur.elderrings.modules.user.api.GetUser;
import org.unamur.elderrings.modules.user.api.models.Resident;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class SetTvPowerImpl implements SetTvPowerInterface {

    private final ConnectedUser user;
    private final GetUser getUser;
    private final SendNotificationInterface sendNotification;

    @Override
    public void setTvPower(boolean on) {
        var contact = getUser.getUser(user.getId());
        if (contact != null
                && contact.getUser() instanceof Resident resident
                && resident.getAutonomyLevel() == Resident.AutonomyLevel.DEPENDENT) {
            throw new ForbiddenException("Dependent residents cannot control the TV manually");
        }

        sendNotification.send(user.getId(), TvPowerMessage.builder()
                .type("TV_POWER")
                .value(on)
                .build());
        log.info("User {} set TV power to {}", user.getId(), on);
    }

}