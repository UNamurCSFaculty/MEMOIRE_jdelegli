package org.unamur.elderrings.app.user.dto;

import java.util.Optional;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContactDto {

  private UUID id;

  private String username;

  private String firstName;

  private String lastName;

  private Boolean isRoom;

  @Schema(description = "User's picture", required = false, type = SchemaType.STRING, format = "base64")
  private Optional<byte[]> picture;

}
