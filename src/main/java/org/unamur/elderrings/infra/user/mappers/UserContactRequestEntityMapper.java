package org.unamur.elderrings.infra.user.mappers;

import org.unamur.elderrings.infra.user.entities.UserContactRequestEntity;
import org.unamur.elderrings.modules.user.api.models.ContactRequest;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserContactRequestEntityMapper {

  public ContactRequest toModel(UserContactRequestEntity entity) {
    if (entity == null) return null;

    return new ContactRequest(
      entity.getId(),
      entity.getRequester().getId(),
      entity.getTarget().getId(),
      ContactRequest.ContactRequestStatus.valueOf(entity.getStatus().name()),
      entity.getCreatedAt(),
      entity.getUpdatedAt()
    );
  }

  public UserContactRequestEntity toEntity(ContactRequest model) {
    if (model == null) return null;

    var entity = new UserContactRequestEntity();
    entity.setId(model.getId());
    // requester and target must be set manually using their UserEntity instances
    entity.setStatus(UserContactRequestEntity.ContactRequestStatusEntity.valueOf(model.getStatus().name()));
    entity.setCreatedAt(model.getCreatedAt());
    entity.setUpdatedAt(model.getUpdatedAt());
    return entity;
  }
  
}
