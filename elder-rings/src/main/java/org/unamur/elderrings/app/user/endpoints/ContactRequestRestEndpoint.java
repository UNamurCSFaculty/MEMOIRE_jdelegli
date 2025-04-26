package org.unamur.elderrings.app.user.endpoints;

import java.util.List;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.user.dto.ContactRequestDto;
import org.unamur.elderrings.app.user.mappers.ContactRequestMapper;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.CreateContactRequest;
import org.unamur.elderrings.modules.user.api.GetPendingContactRequests;
import org.unamur.elderrings.modules.user.api.RespondToContactRequest;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RequiredArgsConstructor
@Tag(name = "ContactManagement")
@Path(Routes.CONTACT_MANAGEMENT_REST_ENDPOINT)
public class ContactRequestRestEndpoint {

  private final CreateContactRequest createContactRequest;
  private final GetPendingContactRequests getPendingContactRequests;
  private final RespondToContactRequest respondToContactRequest;
  private final ConnectedUser connectedUser;

  @GET
  @Path("/pending")
  @PermitAll
  @Operation(operationId = "getPendingRequests")
  public List<ContactRequestDto> getPendingRequests() {
    return getPendingContactRequests.getPendingRequestsForUser(connectedUser.getId())
        .stream()
        .map(ContactRequestMapper::toDto)
        .toList();
  }

  @POST
  @PermitAll
  @Operation(operationId = "createContactRequest")
  public RestResponse<UUID> createContactRequest(@QueryParam("targetId") UUID targetId) {
    UUID requesterId = connectedUser.getId();
    UUID requestId = createContactRequest.createContactRequest(requesterId, targetId);
    return RestResponse.ok(requestId);
  }

  @POST
  @Path("/{requestId}/response")
  @PermitAll
  @Operation(operationId = "respondToContactRequest")
  public RestResponse<Void> respondToContactRequest(@PathParam("requestId") UUID requestId,
                                            @QueryParam("accepted") boolean accepted) {
    respondToContactRequest.respondToRequest(requestId, accepted);
    return RestResponse.ok();
  }
    
}
