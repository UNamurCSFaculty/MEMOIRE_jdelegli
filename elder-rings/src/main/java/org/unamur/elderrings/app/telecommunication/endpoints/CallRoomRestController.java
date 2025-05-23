package org.unamur.elderrings.app.telecommunication.endpoints;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.telecommunication.bodies.CreateCallRoomBody;
import org.unamur.elderrings.app.telecommunication.bodies.RejectCallRoomInvitationBody;
import org.unamur.elderrings.app.telecommunication.dto.CallRoomDto;
import org.unamur.elderrings.app.telecommunication.routes.CreateCallRoomRoute;
import org.unamur.elderrings.app.telecommunication.routes.RejectCallRoomInvitationRoute;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;

@Tag(name = "CallRoom")
@Path(Routes.CALL_ROOM_REST_ENDPOINT)
@RequiredArgsConstructor
public class CallRoomRestController {

  private final CreateCallRoomRoute createCallRoomRoute;
  private final RejectCallRoomInvitationRoute rejectCallRoomInvitationRoute;

  @POST
  @Operation(operationId = "createCallRoom")
  public RestResponse<CallRoomDto> createCallRoom(@Valid @NotNull CreateCallRoomBody body){
    return createCallRoomRoute.createCallRoom(body);
  }

  @POST
  @Path("/reject")
  @Operation(operationId = "rejectCallRoomInvitation")
  public RestResponse<Void> rejectCallRoomInvitation(@Valid @NotNull RejectCallRoomInvitationBody body){
    return rejectCallRoomInvitationRoute.rejectInvitiation(body);
  }

  
  
}
