package org.unamur.elderrings.app.telecommunication.mappers;

import java.util.Objects;

import org.unamur.elderrings.app.telecommunication.dto.CallRoomDto;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CallRoomMapper {

  public CallRoomDto toDto(CallRoom room) {
    if(Objects.isNull(room)) {
      return null;
    }

    return CallRoomDto.builder()
                      .id(room.id().value())
                      .build();
  }
  
}
