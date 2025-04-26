package org.unamur.elderrings.modules.telecommunication.internal;

import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetCallRoomImpl implements GetCallRoomInterface {

  private final CallRoomRepository repository;
  
  @Override
  public CallRoom getCallRoom(CallRoomId id) {
    return repository.findById(id)
                      .orElseThrow(() -> new BadRequestException(String.format("Call room with id %s not found", id.value()))
                      );
  }
  
}
