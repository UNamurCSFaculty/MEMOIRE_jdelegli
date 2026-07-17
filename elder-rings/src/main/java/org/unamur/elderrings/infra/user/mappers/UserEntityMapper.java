package org.unamur.elderrings.infra.user.mappers;

import java.util.Optional;

import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.entities.ResidentEntity;
import org.unamur.elderrings.infra.user.entities.StaffEntity;
import org.unamur.elderrings.infra.user.entities.FamilyEntity;
import org.unamur.elderrings.infra.user.entities.CallPolicyEntity;
import org.unamur.elderrings.modules.user.api.models.Contact;
import org.unamur.elderrings.modules.user.api.models.User;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.Staff;
import org.unamur.elderrings.modules.user.api.models.Family;
import org.unamur.elderrings.modules.user.api.models.UserPicture;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserEntityMapper {

  public User toModel(UserEntity entity){
    if (entity instanceof ResidentEntity r){
      return new Resident(
        r.getId(), 
        r.getUsername(),  
        r.getFirstName(), 
        r.getLastName(), 
        toModel(r.getAutonomyLevel()),
        toModel(r.getCallPolicy())
      );
    }
    if (entity instanceof StaffEntity s) {
      return new Staff(
        s.getId(),
        s.getUsername(),
        s.getFirstName(),
        s.getLastName()
      );
    }
    if (entity instanceof FamilyEntity f) {
      return new Family(
        f.getId(),
        f.getUsername(),
        f.getFirstName(),
        f.getLastName()
      );
    }
    throw new IllegalArgumentException("Unknown user entity type: " + entity.getClass().getName());
  }
  
  public Contact toContact(UserEntity entity){
    Optional<UserPicture> picture = Optional.ofNullable(entity.getPicture())
                                            .map(p -> new UserPicture(p.getImage())); // Safely wrap the picture in Optional
    return new Contact(toModel(entity), picture);
  }

  private Resident.AutonomyLevel toModel(ResidentEntity.AutonomyLevel level) {
    return level == null ? null : Resident.AutonomyLevel.valueOf(level.name());
  }

  private Resident.CallPolicy toModel(CallPolicyEntity policy) {
    return policy == null ? null : new Resident.CallPolicy(policy.isAutoAnswer(), policy.isCameraOnByDefault());
  }

}
