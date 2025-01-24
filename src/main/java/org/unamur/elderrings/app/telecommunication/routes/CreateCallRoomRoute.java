package org.unamur.elderrings.app.telecommunication.routes;

import java.util.HashSet;

import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.telecommunication.bodies.CreateCallRoomBody;
import org.unamur.elderrings.app.telecommunication.dto.CallRoomDto;
import org.unamur.elderrings.app.telecommunication.mappers.CallRoomMapper;
import org.unamur.elderrings.modules.telecommunication.api.CreateCallRoomInterface;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class CreateCallRoomRoute {

  private final CreateCallRoomInterface createCallRoom;

  public RestResponse<CallRoomDto> createCallRoom(CreateCallRoomBody body){

    // input validation
    var userIds = new HashSet<>(body.getUserIds());

    if (userIds.isEmpty()) {
      throw new BadRequestException("User ids cannot be empty");
    }

    // perform business logic
    var room = createCallRoom.createCallRoom(userIds);

    // Output mapping
    var dto = CallRoomMapper.toDto(room);

    return RestResponse.ok(dto);

  }
  
}
