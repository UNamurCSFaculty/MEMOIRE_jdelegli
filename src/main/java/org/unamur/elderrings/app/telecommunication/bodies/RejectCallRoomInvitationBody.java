package org.unamur.elderrings.app.telecommunication.bodies;

import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "RejectCallRoomInvitationBody", description = "The body of the request to reject a call room invitation")
public class RejectCallRoomInvitationBody {

  @NotNull
  @Schema(description = "The room for which the user declined the invitation")
  private UUID roomId;

}
