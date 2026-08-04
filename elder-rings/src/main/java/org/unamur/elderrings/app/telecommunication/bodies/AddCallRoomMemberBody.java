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
@Schema(name = "AddCallRoomMemberBody", description = "The body of the request to bring a user into a running call")
public class AddCallRoomMemberBody {

    @NotNull
    @Schema(description = "The call the user is invited into")
    private UUID roomId;

    @NotNull
    @Schema(description = "The user to invite")
    private UUID userId;

}