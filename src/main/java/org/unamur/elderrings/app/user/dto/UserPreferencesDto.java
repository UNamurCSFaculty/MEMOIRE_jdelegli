package org.unamur.elderrings.app.user.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserPreferencesDto {

    private UserGeneralPreferencesDto general;
    private UserVisualPreferencesDto visual;
    private UserAudioPreferencesDto audio;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserGeneralPreferencesDto {
        private String lang;
        private boolean isPublic;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserVisualPreferencesDto {
        private String textSize; // e.g. "sm", "md", etc.
        private boolean readTextOnScreen;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserAudioPreferencesDto {
        private boolean noiseReduction;
        private List<UserFrequencyGainDto> filters;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserFrequencyGainDto {
        private int frequency;
        private double gain;
    }
}