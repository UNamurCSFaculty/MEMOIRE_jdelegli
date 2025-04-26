package org.unamur.elderrings.app.user.mappers;

import java.util.Optional;

import org.unamur.elderrings.app.user.dto.ContactDto;
import org.unamur.elderrings.modules.user.api.models.Contact;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ContactMapper {

  public ContactDto toDto(Contact model) {
    Optional<byte[]> picture = model.getPicture()
                                 .flatMap(userPicture -> Optional.ofNullable(userPicture.getImage()));

    return new ContactDto(
      model.getUser().getId(), 
      model.getUser().getUsername(),  
      model.getUser().getFirstName(), 
      model.getUser().getLastName(), 
      model.getUser().getIsRoom(),
      picture
    );
  }

}
