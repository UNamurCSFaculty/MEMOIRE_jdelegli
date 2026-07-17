package org.unamur.elderrings.infra.user.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@DiscriminatorValue("STAFF")
public class StaffEntity extends UserEntity {
    
}