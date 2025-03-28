package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetUser;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetUserImpl implements GetUser {

  private final UserRepository repository;

  @Override
  public Contact getUser(UUID userId) {
    var user = repository.getUserById(userId);
    if (user.isPresent()) {
      return UserEntityMapper.toContact(user.get());
    }
    return null;
  }

  
}
