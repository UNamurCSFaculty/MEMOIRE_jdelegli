package org.unamur.elderrings.app.telecommunication.bodies;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "SetTvPowerBody", description = "The body of the request to turn the TV on or off")
public class SetTvPowerBody {

    @NotNull
    @Schema(description = "True to turn the TV on, false to put it in standby")
    private Boolean on;

}