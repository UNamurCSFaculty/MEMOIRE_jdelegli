package org.unamur.elderrings.app.telecommunication.routes;

import java.util.List;
import java.util.UUID;

import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.telecommunication.dto.AddableUsersDto;
import org.unamur.elderrings.app.user.dto.ContactDto;
import org.unamur.elderrings.app.user.mappers.ContactMapper;
import org.unamur.elderrings.modules.telecommunication.api.GetAddableUsersInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class GetAddableUsersRoute {

    private final GetAddableUsersInterface getAddableUsers;

    public RestResponse<AddableUsersDto> getAddableUsers(UUID roomId) {

        // perform business logic
        var addable = getAddableUsers.getAddableUsers(new CallRoomId(roomId));

        return RestResponse.ok(new AddableUsersDto(
                toDto(addable.ownContacts()),
                toDto(addable.colleagues()),
                toDto(addable.residentContacts())));
    }

    private List<ContactDto> toDto(List<Contact> contacts) {
        return contacts.stream().map(ContactMapper::toDto).toList();
    }

}
