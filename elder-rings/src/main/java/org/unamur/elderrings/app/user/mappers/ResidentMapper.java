package org.unamur.elderrings.app.user.mappers;

import java.util.Optional;

import org.unamur.elderrings.app.user.dto.ResidentDto;
import org.unamur.elderrings.modules.user.api.models.Contact;
import org.unamur.elderrings.modules.user.api.models.Resident;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ResidentMapper {

    public ResidentDto toDto(Contact contact, Resident resident) {
        Optional<byte[]> picture = contact.getPicture().flatMap(p -> Optional.ofNullable(p.getImage()));

        return new ResidentDto(
                resident.getId(),
                resident.getUsername(),
                resident.getFirstName(),
                resident.getLastName(),
                resident.getAutonomyLevel(),
                picture);
    }
}