package org.unamur.elderrings.app.user.mappers;

import org.unamur.elderrings.app.user.dto.UserDto;
import org.unamur.elderrings.modules.user.api.models.User;
import org.unamur.elderrings.modules.user.api.models.Resident;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

  public UserDto toDto(User model) {
    return new UserDto(
      model.getId(), 
      model.getUsername(),  
      model.getFirstName(), 
      model.getLastName(), 
      model instanceof Resident
    );
  }
  
}
