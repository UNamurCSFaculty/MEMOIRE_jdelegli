package org.unamur.elderrings.modules.user.api.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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
        private List<DndWindow> windows;

        /**
         * Active when manually enabled, when a timed activation has not
         * expired yet, or when the current time falls in a weekly window.
         */
        public boolean isActiveAt(Instant now) {
            var local = LocalDateTime.ofInstant(now, ZoneId.systemDefault());
            return enabled
                    || (until != null && now.isBefore(until))
                    || (windows != null && windows.stream()
                            .anyMatch(w -> w.isActiveAt(local.getDayOfWeek(), local.toLocalTime())));
        }

        @Getter
        @Setter
        @AllArgsConstructor
        public static class DndWindow {
            private DayOfWeek day;
            private LocalTime start;
            private LocalTime end;

            /**
             * end before start means the window crosses midnight into the
             * next day, as specified by schema.org OpeningHoursSpecification.
             */
            public boolean isActiveAt(DayOfWeek currentDay, LocalTime now) {
                if (start.isBefore(end)) {
                    return currentDay == day && !now.isBefore(start) && now.isBefore(end);
                }
                return (currentDay == day && !now.isBefore(start)) || (currentDay == day.plus(1) && now.isBefore(end));
            }
        }
    }
}
