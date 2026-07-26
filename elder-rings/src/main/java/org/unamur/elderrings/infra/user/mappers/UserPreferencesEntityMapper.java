package org.unamur.elderrings.infra.user.mappers;

import java.util.List;
import org.hibernate.Hibernate;

import org.unamur.elderrings.infra.user.entities.AudioPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.GeneralPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.UserAudioFilterEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.entities.UserPreferencesEntity;
import org.unamur.elderrings.infra.user.entities.CallPolicyPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity.TextSizeEntity;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserPreferencesEntityMapper {

        public UserPreferences toModel(UserPreferencesEntity entity) {
                var owner = (UserEntity) Hibernate.unproxy(entity.getUser());

                return new UserPreferences(
                                entity.getUser().getId(),
                                new UserPreferences.GeneralPreferences(
                                                entity.getGeneral().getLang(),
                                                entity.getGeneral().isPublic(),
                                                entity.getGeneral().isDoNotDisturb()),
                                new UserPreferences.VisualPreferences(
                                                TextSize.valueOf(entity.getVisual().getTextSize().name()),
                                                entity.getVisual().isReadTextOnScreen()),
                                new UserPreferences.AudioPreferences(
                                                entity.getAudio().isCompression(),
                                                entity.getFilters().stream()
                                                                .map(f -> new UserPreferences.FrequencyGain(
                                                                                f.getFrequency(), f.getGain()))
                                                                .toList(),
                                                entity.getAudio().isPlayInterfaceSounds()),
                                owner instanceof ResidentEntity resident
                                                ? toCallPolicy(entity.getCallPolicy(), resident)
                                                : null);
        }

        private UserPreferences.CallPolicyPreferences toCallPolicy(CallPolicyPreferencesEmbeddableEntity stored,
                        ResidentEntity resident) {
                var floor = resident.getAutonomyLevel() != null
                                ? UserPreferences.CallPolicyPreferences.defaultsFor(
                                                Resident.AutonomyLevel.valueOf(resident.getAutonomyLevel().name()))
                                : new UserPreferences.CallPolicyPreferences(false, false);

                if (stored == null) {
                        return floor;
                }
                // the autonomy level dictates a minimum: stored choices can only raise flags,
                // never lower them
                return new UserPreferences.CallPolicyPreferences(
                                stored.isAutoAnswer() || floor.isAutoAnswer(),
                                stored.isCameraOnByDefault() || floor.isCameraOnByDefault());
        }

        public UserPreferencesEntity toEntity(UserPreferences model, UserEntity userEntity) {
                var entity = new UserPreferencesEntity();
                entity.setUser(userEntity);

                var general = new GeneralPreferencesEmbeddableEntity();
                general.setLang(model.getGeneral().getLang());
                general.setPublic(model.getGeneral().isPublic());
                general.setDoNotDisturb(model.getGeneral().isDoNotDisturb());
                entity.setGeneral(general);

                var visual = new VisualPreferencesEmbeddableEntity();
                visual.setTextSize(TextSizeEntity.valueOf(model.getVisual().getTextSize().name()));
                visual.setReadTextOnScreen(model.getVisual().isReadTextOnScreen());
                entity.setVisual(visual);

                var audio = new AudioPreferencesEmbeddableEntity();
                audio.setCompression(model.getAudio().isCompression());
                entity.setAudio(audio);
                audio.setPlayInterfaceSounds(model.getAudio().isPlayInterfaceSounds());

                List<UserAudioFilterEntity> filters = model.getAudio().getFilters().stream().map(f -> {
                        var filter = new UserAudioFilterEntity();
                        filter.setFrequency(f.getFrequency());
                        filter.setGain(f.getGain());
                        filter.setPreferences(entity);
                        return filter;
                }).toList();

                var callPolicy = new CallPolicyPreferencesEmbeddableEntity();
                if (model.getCallPolicy() != null) {
                        callPolicy.setAutoAnswer(model.getCallPolicy().isAutoAnswer());
                        callPolicy.setCameraOnByDefault(model.getCallPolicy().isCameraOnByDefault());
                }
                entity.setCallPolicy(callPolicy);

                entity.setFilters(filters);
                return entity;
        }

}
