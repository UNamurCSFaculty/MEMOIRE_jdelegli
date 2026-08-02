package org.unamur.elderrings.modules.user.internal;

import java.util.List;
import java.util.Optional;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetAllFamilies;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class GetAllFamiliesImpl implements GetAllFamilies {

    private final UserRepository repository;

    @Override
    @Transactional
    public List<Contact> getAllFamilies() {
        return repository.findAllFamilies().stream()
                .map(f -> new Contact(UserEntityMapper.toModel(f), Optional.empty()))
                .toList();
    }
}