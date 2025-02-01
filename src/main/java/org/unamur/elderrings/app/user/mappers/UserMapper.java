package org.unamur.elderrings.app.user.mappers;

import org.unamur.elderrings.app.user.dto.UserDto;
import org.unamur.elderrings.modules.user.api.models.User;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

  public User toModel(UserDto dto){
    return new User(
      dto.getId(), 
      dto.getUsername(),  
      dto.getFirstName(), 
      dto.getLastName(), 
      dto.getIsRoom()
    );
  }

  public UserDto toDto(User model) {
    return new UserDto(
      model.getId(), 
      model.getUsername(),  
      model.getFirstName(), 
      model.getLastName(), 
      model.getIsRoom()
    );
  }
  
}
