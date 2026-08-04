package org.unamur.elderrings.app.telecommunication.dto;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.unamur.elderrings.app.user.dto.ContactDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "The people the caller may bring into a call, grouped by the reason they are reachable")
public class AddableUsersDto {

  @Schema(description = "The caller's own contacts")
  private List<ContactDto> ownContacts;

  @Schema(description = "The other staff members, offered to a staff caller only")
  private List<ContactDto> colleagues;

  @Schema(description = "The contacts of the residents the caller is entitled to reach")
  private List<ContactDto> residentContacts;

}
