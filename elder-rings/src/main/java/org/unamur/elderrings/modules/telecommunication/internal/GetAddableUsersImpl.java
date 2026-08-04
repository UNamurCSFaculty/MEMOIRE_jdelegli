package org.unamur.elderrings.modules.telecommunication.internal;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.telecommunication.api.GetAddableUsersInterface;
import org.unamur.elderrings.modules.telecommunication.api.GetCallRoomInterface;
import org.unamur.elderrings.modules.telecommunication.api.models.AddableUsers;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomMember;
import org.unamur.elderrings.modules.user.api.GetAllStaff;
import org.unamur.elderrings.modules.user.api.GetUser;
import org.unamur.elderrings.modules.user.api.GetUserContacts;
import org.unamur.elderrings.modules.user.api.models.Contact;
import org.unamur.elderrings.modules.user.api.models.Family;
import org.unamur.elderrings.modules.user.api.models.Resident;
import org.unamur.elderrings.modules.user.api.models.Staff;
import org.unamur.elderrings.modules.user.api.models.UserType;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetAddableUsersImpl implements GetAddableUsersInterface {

    private final ConnectedUser user;
    private final GetCallRoomInterface getCallRoom;
    private final GetUser getUser;
    private final GetUserContacts getUserContacts;
    private final GetAllStaff getAllStaff;

    @Override
    public AddableUsers getAddableUsers(CallRoomId roomId) {

        var room = getCallRoom.getCallRoom(roomId);
        var connected = room.connectedMembers();

        // being invited is not being in the call: somebody who declined, hung up
        // or never answered keeps no right over it
        if (!connected.contains(CallRoomMember.of(user))) {
            throw new ForbiddenException("Only a member of the call can invite someone");
        }
        if (user.getUserType() == UserType.RESIDENT) {
            throw new ForbiddenException("A resident cannot invite someone into a call");
        }

        Map<UUID, Contact> ownContacts = new LinkedHashMap<>();
        Map<UUID, Contact> colleagues = new LinkedHashMap<>();
        Map<UUID, Contact> residentContacts = new LinkedHashMap<>();

        // everyone offers their own contacts
        offer(ownContacts, getUserContacts.getUserContacts());

        if (user.getUserType() == UserType.STAFF) {
            offer(colleagues, getAllStaff.getAllStaff());
            residentsAmong(connected)
                    .forEach(residentId -> offer(residentContacts,
                            getUserContacts.getContactsForUser(residentId)));
        } else {
            tutoredResident()
                    .ifPresent(residentId -> offer(residentContacts,
                            getUserContacts.getContactsForUser(residentId)));
            // a family member never reaches the staff, who would otherwise be
            // spammed from every call
            ownContacts.values().removeIf(contact -> contact.getUser() instanceof Staff);
            residentContacts.values().removeIf(contact -> contact.getUser() instanceof Staff);
        }

        // nobody already in the call or whose invitation is still ringing, not
        // the caller either, and nobody twice across the groups
        Set<UUID> alreadyTaken = new HashSet<>();
        room.members().forEach(member -> alreadyTaken.add(member.userId()));
        alreadyTaken.add(user.getId());

        return new AddableUsers(
                keep(ownContacts, alreadyTaken),
                keep(colleagues, alreadyTaken),
                keep(residentContacts, alreadyTaken));
    }

    private void offer(Map<UUID, Contact> group, Collection<Contact> contacts) {
        contacts.forEach(contact -> group.put(contact.getUser().getId(), contact));
    }

    /**
     * Keeps the members of the group that were not taken yet, and marks them as
     * taken so that the next groups do not propose them again.
     */
    private List<Contact> keep(Map<UUID, Contact> group, Set<UUID> alreadyTaken) {
        List<Contact> kept = new ArrayList<>();
        group.forEach((userId, contact) -> {
            if (alreadyTaken.add(userId)) {
                kept.add(contact);
            }
        });
        return kept;
    }

    private List<UUID> residentsAmong(Set<CallRoomMember> members) {
        return members.stream()
                .map(CallRoomMember::userId)
                .map(getUser::getUser)
                .filter(contact -> contact != null && contact.getUser() instanceof Resident)
                .map(contact -> contact.getUser().getId())
                .toList();
    }

    private Optional<UUID> tutoredResident() {
        var self = getUser.getUser(user.getId());
        if (self != null && self.getUser() instanceof Family family) {
            return Optional.ofNullable(family.getTutorOfResidentId());
        }
        return Optional.empty();
    }

}
