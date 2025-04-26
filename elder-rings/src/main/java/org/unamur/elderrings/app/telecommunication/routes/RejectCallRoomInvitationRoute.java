package org.unamur.elderrings.app.telecommunication.routes;

import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.telecommunication.bodies.RejectCallRoomInvitationBody;
import org.unamur.elderrings.modules.telecommunication.api.RejectCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class RejectCallRoomInvitationRoute {

  private final RejectCallRoomInterface rejectCallRoomInterface;

  public RestResponse<Void> rejectInvitiation(RejectCallRoomInvitationBody body){

    // perform business logic
    rejectCallRoomInterface.markRejectedBy(new CallRoomId(body.getRoomId()));

    return RestResponse.ok();

  }
  
}
