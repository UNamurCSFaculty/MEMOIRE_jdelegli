package org.unamur.elderrings.app.user.mappers;

import org.unamur.elderrings.app.user.dto.ContactRequestDto;
import org.unamur.elderrings.modules.user.api.models.ContactRequest;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ContactRequestMapper {

      public static ContactRequestDto toDto(ContactRequest model) {
        if (model == null) return null;

        return new ContactRequestDto(
                model.getId(),
                model.getRequesterId(),
                model.getTargetId(),
                ContactRequestDto.ContactRequestStatusDto.valueOf(model.getStatus().name()),
                model.getCreatedAt(),
                model.getUpdatedAt()
        );
    }

    public static ContactRequest toModel(ContactRequestDto dto) {
        if (dto == null) return null;

        return new ContactRequest(
                dto.getId(),
                dto.getRequesterId(),
                dto.getTargetId(),
                ContactRequest.ContactRequestStatus.valueOf(dto.getStatus().name()),
                dto.getCreatedAt(),
                dto.getUpdatedAt()
        );
    }
  
}
