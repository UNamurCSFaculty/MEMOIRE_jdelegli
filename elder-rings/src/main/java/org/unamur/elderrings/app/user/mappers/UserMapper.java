package org.unamur.elderrings.app.user.mappers;

import org.unamur.elderrings.app.user.dto.UserDto;
import org.unamur.elderrings.modules.user.api.models.User;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.Staff;
import org.unamur.elderrings.modules.user.api.models.Family;
import org.unamur.elderrings.modules.user.api.models.UserType;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

  public UserDto toDto(User model) {
    return new UserDto(
      model.getId(), 
      model.getUsername(),  
      model.getFirstName(), 
      model.getLastName(),
      userTypeOf(model)
    );
  }
  
  static UserType userTypeOf(User model) {
    return switch (model) {
      case Resident r -> UserType.RESIDENT;
      case Staff s -> UserType.STAFF;
      case Family f -> UserType.FAMILY;
      default -> throw new IllegalArgumentException("Unknown user type: " + model.getClass().getName());
    };
  }

}
