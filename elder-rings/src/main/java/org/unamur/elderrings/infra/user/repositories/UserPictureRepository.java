package org.unamur.elderrings.infra.user.repositories;

import org.unamur.elderrings.infra.user.entities.UserPictureEntity;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserPictureRepository implements PanacheRepository<UserPictureEntity> {
    // This can be empty; Panache handles basic CRUD operations for you
}