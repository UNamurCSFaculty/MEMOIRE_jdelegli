package org.unamur.elderrings.modules.telecommunication.api.models;

import java.util.List;
import java.util.stream.Stream;

import org.unamur.elderrings.modules.user.api.models.Contact;

/**
 * The people a member of a call may bring into it, split by the reason they are
 * reachable so the interface can tell where each proposal comes from. Somebody
 * reachable for several reasons only appears in the first group that claims
 * them.
 */
public record AddableUsers(
    List<Contact> ownContacts,
    List<Contact> colleagues,
    List<Contact> residentContacts) {

    public Stream<Contact> all() {
        return Stream.of(ownContacts, colleagues, residentContacts).flatMap(List::stream);
    }

}
