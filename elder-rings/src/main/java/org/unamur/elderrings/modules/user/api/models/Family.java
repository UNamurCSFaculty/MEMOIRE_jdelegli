package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

public class Family extends User {
    public Family(UUID id, String username, String firstName, String lastName) {
        super(id, username, firstName, lastName);
    }
}
