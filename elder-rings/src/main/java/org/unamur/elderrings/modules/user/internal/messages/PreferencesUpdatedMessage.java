package org.unamur.elderrings.modules.user.internal.messages;

import java.util.UUID;

import org.unamur.elderrings.modules.shared.models.SocketMessage;

import lombok.experimental.SuperBuilder;

@SuperBuilder
public class PreferencesUpdatedMessage extends SocketMessage<UUID> {
}