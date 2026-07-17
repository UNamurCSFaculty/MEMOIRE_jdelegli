package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class Resident extends User {

    private AutonomyLevel autonomyLevel;
    private CallPolicy callPolicy;

    public Resident(UUID id, String username, String firstName, String lastName, AutonomyLevel autonomyLevel, CallPolicy callPolicy) {
        super(id, username, firstName, lastName);
        this.autonomyLevel = autonomyLevel;
        this.callPolicy = callPolicy;
    }

    public enum AutonomyLevel {
        AUTONOMOUS, INTERMEDIATE, DEPENDENT
    }
    
    @Getter
    @AllArgsConstructor
    public static class CallPolicy {
        private boolean autoAnswer;
        private boolean cameraOnByDefault;
    }
}
