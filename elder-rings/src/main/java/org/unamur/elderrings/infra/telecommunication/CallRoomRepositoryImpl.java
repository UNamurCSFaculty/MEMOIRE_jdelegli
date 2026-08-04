package org.unamur.elderrings.infra.telecommunication;

import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.unamur.elderrings.modules.telecommunication.api.models.CallRoom;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomCreationDate;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.telecommunication.internal.CallRoomRepository;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * This implementation manage the information about the call room in memory
 * This is something that might needs to be rewritten later on to have more
 * persistancy (or for horitzonal scaling)
 *
 * With more than two participants, members joining, leaving and signaling at
 * the
 * same time is the normal case, so both the room index and the containers
 * handed
 * out through the CallRoom record are concurrent.
 */
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class CallRoomRepositoryImpl implements CallRoomRepository {

  private final Map<CallRoomId, CallRoom> rooms = new ConcurrentHashMap<>();

  @Override
  public Optional<CallRoom> findById(CallRoomId id) {
    return Optional.ofNullable(rooms.get(id));
  }

  @Override
  public CallRoom create(Set<CallRoomMember> members) {
    // the member set is not a snapshot of the invitation: it grows when someone
    // is brought into a call that is already running
    Set<CallRoomMember> roomMembers = ConcurrentHashMap.newKeySet();
    roomMembers.addAll(members);

    CallRoom room = new CallRoom(
        CallRoomId.generateCallRoomId(),
        CallRoomCreationDate.now(),
        roomMembers,
        new ConcurrentHashMap<>(),
        ConcurrentHashMap.newKeySet());
    rooms.put(room.id(), room);
    return room;
  }

  @Override
  public void delete(CallRoomId id) {
    rooms.remove(id);
  }

  /**
   * An additionnal method to clean up memory
   */
  @Scheduled(every = "60m")
  public void cleanUpRooms() {
    if (rooms.isEmpty()) {
      return;
    }

    log.info("Cleaning up call rooms");
    log.info("Number of call rooms before the cleanup {}", rooms.size());

    // First, we clean empty rooms
    rooms.values().removeIf(room -> room.connectedMembers().isEmpty());

    // Then we clean rooms every day, this might be subject to evolution
    rooms.values().removeIf(room -> room.creationDate().isOlderThan(1, ChronoUnit.DAYS));

  }

  @Override
  public void markRejectedBy(CallRoomId id, CallRoomMember rejectedBy) {
    findById(id).ifPresent(room -> room.rejectedBy().add(rejectedBy));
  }

}
