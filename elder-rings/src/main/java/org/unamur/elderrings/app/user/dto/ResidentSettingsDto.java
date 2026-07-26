package org.unamur.elderrings.app.user.dto;

import org.unamur.elderrings.modules.user.api.models.Resident;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResidentSettingsDto {

    private Resident.AutonomyLevel autonomyLevel;
}