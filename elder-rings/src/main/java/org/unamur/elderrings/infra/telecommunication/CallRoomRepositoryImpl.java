package org.unamur.elderrings.infra.telecommunication;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomCreationDate;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.CallRoomRepository;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.constraints.NotNull;
import jakarta.websocket.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * This implementation manage the information about the call room in memory
 * This is something that might needs to be rewritten later on to have more persistancy (or for horitzonal scaling)
 */
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CallRoomRepositoryImpl implements CallRoomRepository  {

  private final List<CallRoom> rooms = new ArrayList<>();
  
  
  @Override
  public Optional<CallRoom> findById(CallRoomId id) {
    return rooms.stream().filter(room -> room.id().equals(id)).findFirst();
  }


  @Override
  public CallRoom create(Set<CallRoomMember> members) {
    CallRoom room = new CallRoom(
      CallRoomId.generateCallRoomId(), 
      CallRoomCreationDate.now(), 
      members, 
      new HashMap<>(members.size()), 
      new ArrayList<>(),
      new HashSet<>()
    );
    rooms.add(room);
    return room;
  }

  @Override
  public void delete(CallRoomId id) {
    rooms.removeIf(room -> room.id().equals(id));
  }

  /**
   * An additionnal method to clean up memory
   */
  @Scheduled(every = "60m")
  public void cleanUpRooms() {
    if(rooms.isEmpty()) {
      return;
    }

    log.info("Cleaning up call rooms");
    log.info("Number of call rooms before the cleanup {}", rooms.size());

    // First, we clean empty rooms
    rooms.removeIf(room -> room.sessions().values().stream().filter(Session :: isOpen).toList().isEmpty());

    // Then we clean rooms every day, this might be subject to evolution
    rooms.removeIf(room -> room.creationDate().isOlderThan(1, ChronoUnit.DAYS));

  }


  @Override
  public void markRejectedBy(CallRoomId id, CallRoomMember rejectedBy) {
    var room = findById(id);
    if(room.isPresent()) {
      room.get().rejectedBy().add(rejectedBy);
    }
  }
  
}
