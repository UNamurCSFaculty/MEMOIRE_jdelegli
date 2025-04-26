package org.unamur.elderrings.modules.telecommunication.internal;

import java.io.IOException;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.BroadcastCallRoomMessageInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class BroadcastCallRoomMessageImpl implements BroadcastCallRoomMessageInterface {

    private final ConnectedUser user;

    private final CallRoomRepository repository;

    @Override
    public void broadcastMessage(CallRoomId roomId, String message) {

        var room = repository.findById(roomId).orElseThrow(() -> new BadRequestException("Call room not found"));
        
        // add the message in the room
        room.messages().add(message);
        

        //broadcast message to all room members (except the one who sent the message)
        room.sessions()
            .keySet()
            .stream()
            .filter(member -> !member.equals(CallRoomMember.of(user)))
            .forEach(member -> {
              try {
                var session = room.sessions().get(member);

                if(session.isOpen()) {
                  session.getBasicRemote().sendText(message);
                }
              } catch(IOException e) {
                log.error("Failed to send message to session", e);
              }
            });
    }
    
}
