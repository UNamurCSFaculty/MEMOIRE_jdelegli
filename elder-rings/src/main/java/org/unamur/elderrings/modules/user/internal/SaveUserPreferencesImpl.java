package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;
import java.util.stream.Stream;

import org.unamur.elderrings.infra.user.mappers.UserPreferencesEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserPreferencesRepository;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.SaveUserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences;
import org.unamur.elderrings.modules.user.api.models.UserPreferences.DndPreferences.DndWindow;
import org.unamur.elderrings.modules.user.api.models.UserType;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.notification.api.SendNotificationInterface;
import org.unamur.elderrings.modules.user.internal.messages.PreferencesUpdatedMessage;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class SaveUserPreferencesImpl implements SaveUserPreferences {

    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;
    private final SendNotificationInterface sendNotification;
    private final ConnectedUser connectedUser;

    @Override
    @Transactional
    public void savePreferences(UUID userId, UserPreferences preferences) {
        var user = userRepository.getUserById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        var existing = preferencesRepository.findByUserId(userId);

        // Check locks only for family users (e.g. tutors)
        if (connectedUser.getUserType() == UserType.FAMILY) {
            existing.map(UserPreferencesEntityMapper::toModel)
                    .ifPresent(stored -> enforceLocks(preferences, stored));
        }

        var entity = UserPreferencesEntityMapper.toEntity(preferences, user);
        if (existing.isPresent()) {
            entity.setId(existing.get().getId());
            preferencesRepository.getEntityManager().merge(entity);
        } else {
            preferencesRepository.persist(entity);
        }

        sendNotification.send(userId,
                PreferencesUpdatedMessage.builder().type("PREFERENCES_UPDATED").value(userId).build());
    }

    /**
     * Staff-set locks bind tutors only: a locked section is silently restored
     * from the stored state, locked windows always survive whatever was sent,
     * and a tutor can never set or clear a lock flag himself.
     */
    private void enforceLocks(UserPreferences incoming, UserPreferences stored) {
        // Tutor can never set or clear a lock flag, so we unlock everything first
        if (incoming.getCallPolicy() != null) {
            incoming.getCallPolicy().setLocked(false);
        }
        incoming.getDnd().setLocked(false);
        incoming.getDnd().getWindows().forEach(w -> w.setLocked(false));

        // If CallPolicy is locked, restore it from the stored state
        if (stored.getCallPolicy() != null && stored.getCallPolicy().isLocked()) {
            incoming.setCallPolicy(stored.getCallPolicy());
        }

        // If Dnd is locked, restore it from the stored state
        if (stored.getDnd().isLocked()) {
            incoming.setDnd(stored.getDnd());
            return; // Early return because if Dnd is locked, we don't need to check windows
        }

        // If Dnd is not locked, we still need to check for locked windows
        // Collect all locked windows from the stored preferences
        var locked = stored.getDnd().getWindows().stream().filter(DndWindow::isLocked).toList();
        incoming.getDnd().setWindows(Stream.concat(
                // Keep windows that are not locked in the stored state
                incoming.getDnd().getWindows().stream()
                        .filter(w -> locked.stream().noneMatch(l -> sameSlot(l, w))),
                locked.stream()).toList()); // + all locked windows from the stored state
    }

    private boolean sameSlot(DndWindow a, DndWindow b) {
        return a.getDay() == b.getDay()
                && a.getStart().equals(b.getStart())
                && a.getEnd().equals(b.getEnd());
    }
}