package org.unamur.elderrings.app.user.mappers;

import org.unamur.elderrings.app.user.dto.UserPreferencesDto;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserPreferencesDtoMapper {

    public UserPreferences toModel(UserPreferencesDto dto, java.util.UUID userId) {
        return new UserPreferences(
                userId,
                new UserPreferences.GeneralPreferences(
                        dto.getGeneral().getLang(),
                        dto.getGeneral().isPublic()
                ),
                new UserPreferences.VisualPreferences(
                        TextSize.valueOf(dto.getVisual().getTextSize().toUpperCase()),
                        dto.getVisual().isReadTextOnScreen()
                ),
                new UserPreferences.AudioPreferences(
                        dto.getAudio().isCompression(),
                        dto.getAudio().getFilters().stream()
                                .map(f -> new UserPreferences.FrequencyGain(f.getFrequency(), f.getGain()))
                                .toList()
                )
        );
    }

    public UserPreferencesDto toDto(UserPreferences model) {
        return new UserPreferencesDto(
                new UserPreferencesDto.UserGeneralPreferencesDto(
                        model.getGeneral().getLang(),
                        model.getGeneral().isPublic()
                ),
                new UserPreferencesDto.UserVisualPreferencesDto(
                        model.getVisual().getTextSize().name().toLowerCase(),
                        model.getVisual().isReadTextOnScreen()
                ),
                new UserPreferencesDto.UserAudioPreferencesDto(
                        model.getAudio().isCompression(),
                        model.getAudio().getFilters().stream()
                                .map(f -> new UserPreferencesDto.UserFrequencyGainDto(f.getFrequency(), f.getGain()))
                                .toList()
                )
        );
    }
}