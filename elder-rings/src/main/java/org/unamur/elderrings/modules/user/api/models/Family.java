package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

import lombok.Getter;

@Getter
public class Family extends User {

    private UUID tutorOfResidentId;

    public Family(UUID id, String username, String firstName, String lastName, UUID tutorOfResidentId) {
        super(id, username, firstName, lastName);
        this.tutorOfResidentId = tutorOfResidentId;
    }
}
