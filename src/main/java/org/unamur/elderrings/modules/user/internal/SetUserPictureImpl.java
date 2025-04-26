package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.SetUserPicture;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class SetUserPictureImpl implements SetUserPicture {

  private final UserRepository repository;

  private final ConnectedUser user;

  @Override
  public UUID setPicture(byte[] image) {
    return repository.setUserPicture(user.getId(), image);
  }
  
}
