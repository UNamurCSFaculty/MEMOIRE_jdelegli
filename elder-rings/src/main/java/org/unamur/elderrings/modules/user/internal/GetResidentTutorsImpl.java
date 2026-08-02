package org.unamur.elderrings.modules.user.internal;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetResidentTutors;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetResidentTutorsImpl implements GetResidentTutors {

    private final UserRepository repository;

    @Override
    @Transactional
    public List<Contact> getTutorsOfResident(UUID residentId) {
        return repository.findTutorsOfResident(residentId)
                .stream()
                .map(UserEntityMapper::toContact)
                .toList();
    }
}