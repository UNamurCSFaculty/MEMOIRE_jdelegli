package org.unamur.elderrings.app.telecommunication.endpoints;

import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.telecommunication.bodies.AddCallRoomMemberBody;
import org.unamur.elderrings.app.telecommunication.bodies.CreateCallRoomBody;
import org.unamur.elderrings.app.telecommunication.bodies.RejectCallRoomInvitationBody;
import org.unamur.elderrings.app.telecommunication.dto.AddableUsersDto;
import org.unamur.elderrings.app.telecommunication.dto.CallRoomDto;
import org.unamur.elderrings.app.telecommunication.routes.AddCallRoomMemberRoute;
import org.unamur.elderrings.app.telecommunication.routes.CreateCallRoomRoute;
import org.unamur.elderrings.app.telecommunication.routes.GetAddableUsersRoute;
import org.unamur.elderrings.app.telecommunication.routes.RejectCallRoomInvitationRoute;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.Produces;
import lombok.RequiredArgsConstructor;

@Tag(name = "CallRoom")
@Path(Routes.CALL_ROOM_REST_ENDPOINT)
@RequiredArgsConstructor
public class CallRoomRestController {

  private final CreateCallRoomRoute createCallRoomRoute;
  private final RejectCallRoomInvitationRoute rejectCallRoomInvitationRoute;
  private final GetAddableUsersRoute getAddableUsersRoute;
  private final AddCallRoomMemberRoute addCallRoomMemberRoute;

  @POST
  @Operation(operationId = "createCallRoom")
  public RestResponse<CallRoomDto> createCallRoom(@Valid @NotNull CreateCallRoomBody body) {
    return createCallRoomRoute.createCallRoom(body);
  }

  @POST
  @Path("/reject")
  @Operation(operationId = "rejectCallRoomInvitation")
  public RestResponse<Void> rejectCallRoomInvitation(@Valid @NotNull RejectCallRoomInvitationBody body) {
    return rejectCallRoomInvitationRoute.rejectInvitiation(body);
  }

  @GET
  @Path("/addable-users")
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(operationId = "getAddableCallRoomUsers")
  public RestResponse<AddableUsersDto> getAddableUsers(@QueryParam("roomId") @NotNull UUID roomId) {
    return getAddableUsersRoute.getAddableUsers(roomId);
  }

  @POST
  @Path("/add-member")
  @Operation(operationId = "addCallRoomMember")
  public RestResponse<Void> addMember(@Valid @NotNull AddCallRoomMemberBody body) {
    return addCallRoomMemberRoute.addMember(body);
  }
}
