package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

import lombok.Getter;

@Getter
public class Resident extends User {

    private AutonomyLevel autonomyLevel;

    public Resident(UUID id, String username, String firstName, String lastName, AutonomyLevel autonomyLevel) {
        super(id, username, firstName, lastName);
        this.autonomyLevel = autonomyLevel;
    }

    public enum AutonomyLevel {
        AUTONOMOUS, INTERMEDIATE, DEPENDENT
    }
}
