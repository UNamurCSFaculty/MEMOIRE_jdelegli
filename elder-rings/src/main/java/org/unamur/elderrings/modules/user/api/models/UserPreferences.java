package org.unamur.elderrings.modules.user.api.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class UserPreferences {
    private UUID userId;
    private GeneralPreferences general;
    private VisualPreferences visual;
    private AudioPreferences audio;
    private CallPolicyPreferences callPolicy;
    private DndPreferences dnd;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class GeneralPreferences {
        private String lang;
        private boolean isPublic;
    }

    public enum TextSize {
        SM, MD, LG, XL, XXL
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class VisualPreferences {
        private TextSize textSize;
        private boolean readTextOnScreen;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class AudioPreferences {
        private boolean compression;
        private List<FrequencyGain> filters;
        private boolean playInterfaceSounds;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class FrequencyGain {
        private int frequency; // 0–20000 Hz
        private double gain; // e.g., -20.0 to +20.0 dB
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CallPolicyPreferences {
        private boolean autoAnswer;
        private boolean cameraOnByDefault;

        public static CallPolicyPreferences defaultsFor(Resident.AutonomyLevel level) {
            return switch (level) {
                case AUTONOMOUS -> new CallPolicyPreferences(false, false);
                case INTERMEDIATE -> new CallPolicyPreferences(true, false);
                case DEPENDENT -> new CallPolicyPreferences(true, true);
            };
        }

    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class DndPreferences {
        private boolean enabled;
        private Instant until;
        private Integer durationMinutes;

        /**
         * The do-not-disturb mode is active when manually enabled or when
         * a timed activation has not expired yet.
         */
        public boolean isActiveAt(Instant now) {
            return enabled || (until != null && now.isBefore(until));
        }
    }
}
