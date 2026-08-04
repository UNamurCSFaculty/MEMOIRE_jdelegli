package org.unamur.elderrings.app.telecommunication.routes;

import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.telecommunication.bodies.AddCallRoomMemberBody;
import org.unamur.elderrings.modules.telecommunication.api.AddCallRoomMemberInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class AddCallRoomMemberRoute {

    private final AddCallRoomMemberInterface addCallRoomMember;

    public RestResponse<Void> addMember(AddCallRoomMemberBody body) {

        // perform business logic
        addCallRoomMember.addMember(new CallRoomId(body.getRoomId()), body.getUserId());

        return RestResponse.ok();
    }

}