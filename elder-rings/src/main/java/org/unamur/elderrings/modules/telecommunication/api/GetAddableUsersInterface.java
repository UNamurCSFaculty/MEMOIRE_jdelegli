package org.unamur.elderrings.modules.telecommunication.api;

import org.unamur.elderrings.modules.telecommunication.api.models.AddableUsers;
import org.unamur.elderrings.modules.telecommunication.api.models.CallRoomId;

public interface GetAddableUsersInterface {

    /**
     * The users the connected member may bring into this call, grouped by the
     * reason they are reachable: everyone offers their own contacts, a tutor
     * also offers the contacts of their relative, and the staff also offers the
     * colleagues and the contacts of the residents taking part in the call. A
     * resident invites nobody.
     */
    AddableUsers getAddableUsers(CallRoomId roomId);

}
