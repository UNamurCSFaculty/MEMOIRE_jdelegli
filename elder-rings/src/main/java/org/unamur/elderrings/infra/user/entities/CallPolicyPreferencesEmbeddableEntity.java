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
public class CallPolicyPreferencesEmbeddableEntity {

    @Column(name = "auto_answer")
    private boolean autoAnswer;

    @Column(name = "camera_on_by_default")
    private boolean cameraOnByDefault;

    @Column(name = "call_policy_locked")
    private boolean locked;
}