package org.unamur.elderrings.modules.user.internal;

import java.util.List;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetAllStaff;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetAllStaffImpl implements GetAllStaff {

    private final UserRepository repository;

    @Override
    @Transactional
    public List<Contact> getAllStaff() {
        return repository.findAllStaff().stream().map(UserEntityMapper::toContact).toList();
    }
}