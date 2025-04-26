package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.Contact;

public interface GetUser {

  Contact getUser(UUID userId);

}