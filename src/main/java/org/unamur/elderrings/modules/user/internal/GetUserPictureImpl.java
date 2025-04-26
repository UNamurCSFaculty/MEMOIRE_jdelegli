package org.unamur.elderrings.modules.user.internal;

import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserPictureEntity;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.GetUserPicture;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetUserPictureImpl implements GetUserPicture {

  private final UserRepository repository;

  private final ConnectedUser user;

  @Override
  public byte[] getPicture(UUID userId) {
    return repository.getUserPicture(userId)
      .map(UserPictureEntity::getImage)
      .orElse(null);
  }

  @Override
  public byte[] getConnectedUserPicture() {
    return repository.getUserPicture(user.getId())
      .map(UserPictureEntity::getImage)
      .orElse(null);
  }
  
}
