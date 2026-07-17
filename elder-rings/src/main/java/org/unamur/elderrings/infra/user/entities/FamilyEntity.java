package org.unamur.elderrings.infra.user.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@DiscriminatorValue("FAMILY")
public class FamilyEntity extends UserEntity {
    
}