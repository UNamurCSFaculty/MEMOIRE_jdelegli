package org.unamur.elderrings.app.telecommunication.endpoints;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.telecommunication.bodies.SetTvPowerBody;
import org.unamur.elderrings.app.telecommunication.routes.SetTvPowerRoute;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;

@Tag(name = "Tv")
@Path(Routes.TV_REST_ENDPOINT)
@RequiredArgsConstructor
public class TvRestController {

    private final SetTvPowerRoute setTvPowerRoute;

    @POST
    @Path("/power")
    @Operation(operationId = "setTvPower")
    public RestResponse<Void> setTvPower(@Valid @NotNull SetTvPowerBody body) {
        return setTvPowerRoute.setTvPower(body);
    }

}