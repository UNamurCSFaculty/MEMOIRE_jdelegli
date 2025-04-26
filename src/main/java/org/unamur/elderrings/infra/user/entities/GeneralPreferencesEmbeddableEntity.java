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
public class GeneralPreferencesEmbeddableEntity {

    @Column(name = "preferred_lang")
    private String lang;

    @Column(name = "is_profile_public")
    private boolean isPublic;
}