package org.unamur.elderrings.app.telecommunication.bodies;

import java.util.List;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "CreateCallRoomBody", description = "The body of the request to create a call room")
public class CreateCallRoomBody {

  @Size(min = 1, max = 1) // Note : this might evolve, currently it's only 1 to 1 calls
  @NotNull
  @Schema(description = "The list of the users that the source use wants to call")
  private List<UUID> userIds;

}
