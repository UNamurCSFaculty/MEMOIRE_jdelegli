package org.unamur.elderrings.modules.user.internal;

import java.util.List;

import org.unamur.elderrings.infra.user.mappers.UserEntityMapper;
import org.unamur.elderrings.infra.user.repositories.UserContactRepository;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.GetUserContacts;
import org.unamur.elderrings.modules.user.api.models.Contact;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GetUserContactsImpl implements GetUserContacts {

  private final ConnectedUser user;

  private final UserContactRepository repository;

  @Override
  public List<Contact> getUserContacts() {
    return repository.findContactsByUserId(user.getId()).stream().map(UserEntityMapper::toContact).toList();
  }
  
}
