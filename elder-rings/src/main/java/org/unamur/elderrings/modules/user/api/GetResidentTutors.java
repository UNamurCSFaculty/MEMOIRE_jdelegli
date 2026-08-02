package org.unamur.elderrings.modules.user.api;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.modules.user.api.models.Contact;

public interface GetResidentTutors {
    List<Contact> getTutorsOfResident(UUID residentId);
}