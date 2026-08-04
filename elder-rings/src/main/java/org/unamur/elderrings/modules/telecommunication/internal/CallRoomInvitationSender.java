package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.UUID;

import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.internal.messages.CallRoomInvitationMessage;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserType;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;

/**
 * Builds the invitation of one recipient. Shared by the room creation and by
 * the addition of a participant to a running call, so the call policy cannot
 * diverge between the two paths.
 */
@ApplicationScoped
@RequiredArgsConstructor
public class CallRoomInvitationSender {

    private final SendNotificationInterface sendNotification;

    public void invite(CallRoom room, UUID recipientId, UserPreferences recipientPreferences,
            UUID inviterId, UserType inviterType) {

        // a null call policy section means the recipient is not a resident
        var policy = recipientPreferences.getCallPolicy();
        Boolean autoAnswer = null;
        Boolean cameraOn = null;

        if (policy != null) {
            autoAnswer = policy.isAutoAnswer();
            // call initiated by a staff member, camera should be off by default
            // (ethical reason)
            cameraOn = policy.isCameraOnByDefault() && inviterType != UserType.STAFF;
        }

        sendNotification.send(recipientId, CallRoomInvitationMessage.builder()
                .type("CALL_ROOM_INVITATION")
                .value(CallRoomInvitationMessage.CallRoomInvitationMessageValue.builder()
                        .roomId(room.id().value())
                        .userId(inviterId)
                        .autoAnswer(autoAnswer)
                        .cameraOn(cameraOn)
                        .build())
                .build());
    }

}