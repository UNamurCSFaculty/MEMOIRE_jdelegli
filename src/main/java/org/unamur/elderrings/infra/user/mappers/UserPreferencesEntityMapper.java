package org.unamur.elderrings.infra.user.mappers;

import java.util.List;

import org.unamur.elderrings.infra.user.entities.AudioPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.GeneralPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.UserAudioFilterEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.entities.UserPreferencesEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity.TextSizeEntity;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserPreferencesEntityMapper {

    public UserPreferences toModel(UserPreferencesEntity entity) {
        return new UserPreferences(
                entity.getUser().getId(),
                new UserPreferences.GeneralPreferences(
                        entity.getGeneral().getLang(),
                        entity.getGeneral().isPublic()
                ),
                new UserPreferences.VisualPreferences(
                        TextSize.valueOf(entity.getVisual().getTextSize().name()),
                        entity.getVisual().isReadTextOnScreen()
                ),
                new UserPreferences.AudioPreferences(
                        entity.getAudio().isNoiseReduction(),
                        entity.getFilters().stream()
                                .map(f -> new UserPreferences.FrequencyGain(f.getFrequency(), f.getGain()))
                                .toList()
                )
        );
    }

    public UserPreferencesEntity toEntity(UserPreferences model, UserEntity userEntity) {
        var entity = new UserPreferencesEntity();
        entity.setUser(userEntity);

        var general = new GeneralPreferencesEmbeddableEntity();
        general.setLang(model.getGeneral().getLang());
        general.setPublic(model.getGeneral().isPublic());
        entity.setGeneral(general);

        var visual = new VisualPreferencesEmbeddableEntity();
        visual.setTextSize(TextSizeEntity.valueOf(model.getVisual().getTextSize().name()));
        visual.setReadTextOnScreen(model.getVisual().isReadTextOnScreen());
        entity.setVisual(visual);

        var audio = new AudioPreferencesEmbeddableEntity();
        audio.setNoiseReduction(model.getAudio().isNoiseReduction());
        entity.setAudio(audio);

        List<UserAudioFilterEntity> filters = model.getAudio().getFilters().stream().map(f -> {
            var filter = new UserAudioFilterEntity();
            filter.setFrequency(f.getFrequency());
            filter.setGain(f.getGain());
            filter.setPreferences(entity);
            return filter;
        }).toList();

        entity.setFilters(filters);
        return entity;
    }
    
}
