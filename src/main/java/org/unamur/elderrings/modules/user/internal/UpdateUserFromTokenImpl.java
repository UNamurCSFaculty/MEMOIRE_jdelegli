package org.unamur.elderrings.modules.user.internal;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.UpdateUserFromToken;
import org.unamur.elderrings.modules.user.api.models.User;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class UpdateUserFromTokenImpl implements UpdateUserFromToken {

  private final ConnectedUser user;

  private final UserRepository repository;

  @Override
  public User createOrUpdateUser() {
    return UserEntityMapper.toModel(
      repository.createOrUpdateUser(
        user.getId(), 
        user.getUsername(), 
        user.getGivenName(), 
        user.getFamilyName(), 
        user.isRoom()
      )
    );
  }
  
}
