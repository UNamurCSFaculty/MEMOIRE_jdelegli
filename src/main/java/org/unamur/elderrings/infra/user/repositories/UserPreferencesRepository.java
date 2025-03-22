package org.unamur.elderrings.infra.user.repositories;

import java.util.Optional;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserPreferencesEntity;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserPreferencesRepository implements PanacheRepository<UserPreferencesEntity> {

    public Optional<UserPreferencesEntity> findByUserId(UUID userId) {
        return find("user.id", userId).firstResultOptional();
    }
}
