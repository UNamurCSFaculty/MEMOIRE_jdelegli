package org.unamur.elderrings.modules.user.api.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

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
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class FrequencyGain {
        private int frequency; // 0–20000 Hz
        private double gain;   // e.g., -20.0 to +20.0 dB
    }
}
