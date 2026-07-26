package org.unamur.elderrings.infra.user.entities;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@DiscriminatorValue("RESIDENT")
public class ResidentEntity extends UserEntity {
    
    public enum AutonomyLevel {
        AUTONOMOUS, INTERMEDIATE, DEPENDENT
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "autonomy_level")
    private AutonomyLevel autonomyLevel;
}
