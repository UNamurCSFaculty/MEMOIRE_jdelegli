package org.unamur.elderrings.infra.user.entities;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class DndPreferencesEmbeddableEntity {
    @Column(name = "do_not_disturb")
    private boolean doNotDisturb;

    @Column(name = "do_not_disturb_until")
    private Instant doNotDisturbUntil;

    @Column(name = "do_not_disturb_duration_minutes")
    private Integer doNotDisturbDurationMinutes;

    @Column(name = "do_not_disturb_locked")
    private boolean locked;
}
