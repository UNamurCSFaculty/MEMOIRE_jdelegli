package org.unamur.elderrings.app.user.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserDto {

  private UUID id;

  private String username;

  private String firstName;

  private String lastName;

  private Boolean isRoom;

}
