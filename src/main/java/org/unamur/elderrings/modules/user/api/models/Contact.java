package org.unamur.elderrings.modules.user.api.models;

import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Contact  {

  User user;
  Optional<UserPicture> picture;
  
}
