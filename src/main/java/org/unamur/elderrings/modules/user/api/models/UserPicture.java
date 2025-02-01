package org.unamur.elderrings.modules.user.api.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserPicture {

  private UUID id;

  private byte[] image;
}
