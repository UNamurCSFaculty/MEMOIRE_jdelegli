package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

public class Staff extends User {
    public Staff(UUID id, String username, String firstName, String lastName) {
        super(id, username, firstName, lastName);
    }
}
