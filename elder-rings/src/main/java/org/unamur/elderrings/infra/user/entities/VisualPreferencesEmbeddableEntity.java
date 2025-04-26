package org.unamur.elderrings.infra.user.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class VisualPreferencesEmbeddableEntity {

    public enum TextSizeEntity {
      SM, MD, LG, XL, XXL
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "text_size")
    private TextSizeEntity textSize;

    @Column(name = "screen_reader_enabled")
    private boolean readTextOnScreen;
}