package org.unamur.elderrings.infra.user.mappers;

import java.util.List;
import org.hibernate.Hibernate;

import org.unamur.elderrings.infra.user.entities.AudioPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.GeneralPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.UserAudioFilterEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.entities.UserPreferencesEntity;
import org.unamur.elderrings.infra.user.entities.CallPolicyPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.DndPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.entities.DndWindowEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity;
import org.unamur.elderrings.infra.user.entities.VisualPreferencesEmbeddableEntity.TextSizeEntity;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.TextSize;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.DndPreferences.DndWindow;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserPreferencesEntityMapper {

        public UserPreferences toModel(UserPreferencesEntity entity) {
                var owner = (UserEntity) Hibernate.unproxy(entity.getUser());

                return new UserPreferences(
                                entity.getUser().getId(),
                                new UserPreferences.GeneralPreferences(
                                                entity.getGeneral().getLang(),
                                                entity.getGeneral().isPublic()),
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
                                                : null,
                                new UserPreferences.DndPreferences(
                                                entity.getDnd().isDoNotDisturb(),
                                                entity.getDnd().getDoNotDisturbUntil(),
                                                dndDurationFor(entity.getDnd().getDoNotDisturbDurationMinutes(), owner),
                                                entity.getDndWindows().stream()
                                                                .map(w -> new DndWindow(
                                                                                w.getDay(),
                                                                                w.getStartTime(),
                                                                                w.getEndTime(),
                                                                                w.isLocked()))
                                                                .toList(),
                                                entity.getDnd().isLocked()));
        }

        private UserPreferences.CallPolicyPreferences toCallPolicy(CallPolicyPreferencesEmbeddableEntity stored,
                        ResidentEntity resident) {
                var floor = resident.getAutonomyLevel() != null
                                ? UserPreferences.CallPolicyPreferences.defaultsFor(
                                                Resident.AutonomyLevel.valueOf(resident.getAutonomyLevel().name()))
                                : new UserPreferences.CallPolicyPreferences(false, false, false);

                if (stored == null) {
                        return floor;
                }
                // the autonomy level dictates a minimum: stored choices can only raise flags,
                // never lower them
                return new UserPreferences.CallPolicyPreferences(
                                stored.isAutoAnswer() || floor.isAutoAnswer(),
                                stored.isCameraOnByDefault() || floor.isCameraOnByDefault(),
                                stored.isLocked());
        }

        // Dnd auto disable is required for intermediate residents
        private Integer dndDurationFor(Integer stored, UserEntity owner) {
                if (stored == null
                                && owner instanceof ResidentEntity resident
                                && resident.getAutonomyLevel() == ResidentEntity.AutonomyLevel.INTERMEDIATE) {
                        return 60; // Dnd auto disable for intermediate residents is 60 minutes by default
                }
                return stored;
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

                List<DndWindowEntity> dndWindows = model.getDnd().getWindows() == null
                                ? List.of()
                                : model.getDnd().getWindows().stream().map(w -> {
                                        var window = new DndWindowEntity();
                                        window.setDay(w.getDay());
                                        window.setStartTime(w.getStart());
                                        window.setEndTime(w.getEnd());
                                        window.setLocked(w.isLocked());
                                        window.setPreferences(entity);
                                        return window;
                                }).toList();

                entity.setDndWindows(dndWindows);

                var callPolicy = new CallPolicyPreferencesEmbeddableEntity();
                if (model.getCallPolicy() != null) {
                        callPolicy.setAutoAnswer(model.getCallPolicy().isAutoAnswer());
                        callPolicy.setCameraOnByDefault(model.getCallPolicy().isCameraOnByDefault());
                        callPolicy.setLocked(model.getCallPolicy().isLocked());
                }
                entity.setCallPolicy(callPolicy);

                var dnd = new DndPreferencesEmbeddableEntity();
                dnd.setDoNotDisturb(model.getDnd().isEnabled());
                dnd.setDoNotDisturbUntil(model.getDnd().getUntil());
                dnd.setDoNotDisturbDurationMinutes(model.getDnd().getDurationMinutes());
                dnd.setLocked(model.getDnd().isLocked());
                entity.setDnd(dnd);

                entity.setFilters(filters);
                return entity;
        }

}
