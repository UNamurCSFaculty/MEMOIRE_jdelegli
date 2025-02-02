package org.unamur.elderrings.infra.user.mappers;

import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.modules.user.api.models.Contact;
import org.unamur.elderrings.modules.user.api.models.User;
import org.unamur.elderrings.modules.user.api.models.UserPicture;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserEntityMapper {

  public User toModel(UserEntity entity){
    return new User(
      entity.getId(), 
      entity.getUsername(),  
      entity.getFirstName(), 
      entity.getLastName(), 
      entity.getIsRoom()
    );
  }

  public UserEntity toEntity(User model) {
    var entity = new UserEntity();
    entity.setFirstName(model.getFirstName());
    entity.setId(model.getId());
    entity.setIsRoom(model.getIsRoom());
    entity.setLastName(model.getLastName());
    entity.setUsername(model.getUsername());
    return entity;
  }
  
  public Contact toContact(UserEntity entity){
    User user = new User(
      entity.getId(), 
      entity.getUsername(),  
      entity.getFirstName(), 
      entity.getLastName(), 
      entity.getIsRoom()
    );
    UserPicture picture = null;
    if (entity.getPicture() != null) {
      picture = new UserPicture(entity.getPicture().getImage());
    }
    return new Contact(user, picture);
  }
  
}
