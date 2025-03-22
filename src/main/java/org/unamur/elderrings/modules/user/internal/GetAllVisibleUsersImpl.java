package org.unamur.elderrings.modules.user.internal;

import java.util.List;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserRepository;
import org.unamur.elderrings.modules.user.api.GetAllVisibleUsers;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetAllVisibleUsersImpl implements GetAllVisibleUsers {

  private final UserRepository repository;

  @Override
  public List<Contact> getAllVisibleUsers() {
    return repository.listAll().stream().map(UserEntityMapper::toContact).toList();
  }
  
}
