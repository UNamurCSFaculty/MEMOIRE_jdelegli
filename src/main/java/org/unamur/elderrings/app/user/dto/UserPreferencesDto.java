package org.unamur.elderrings.app.user.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

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
        @JsonProperty("isPublic")
        private boolean isPublic;
    }

    public enum TextSizeDto {
      SM, MD, LG, XL, XXL
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserVisualPreferencesDto {
        private TextSizeDto textSize; // e.g. "sm", "md", etc.
        private boolean readTextOnScreen;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserAudioPreferencesDto {
        private boolean compression;
        private List<UserFrequencyGainDto> filters;
        private boolean playInterfaceSounds;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserFrequencyGainDto {
        private int frequency;
        private double gain;
    }
}