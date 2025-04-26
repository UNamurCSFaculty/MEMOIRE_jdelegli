package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class User {

  private UUID id;

  private String username;

  private String firstName;

  private String lastName;

  private Boolean isRoom;

}
