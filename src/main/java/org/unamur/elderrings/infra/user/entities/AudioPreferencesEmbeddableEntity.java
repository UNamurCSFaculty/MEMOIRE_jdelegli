package org.unamur.elderrings.infra.user.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class AudioPreferencesEmbeddableEntity {

    @Column(name = "noise_reduction_enabled")
    private boolean noiseReduction;

}
