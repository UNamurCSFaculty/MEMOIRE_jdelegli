package org.unamur.elderrings.modules.authentication.services;

import java.util.UUID;

import io.quarkus.security.ForbiddenException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import lombok.RequiredArgsConstructor;

@RequestScoped
@RequiredArgsConstructor
public class ConnectedUser {

  private final SecurityIdentity identity;

  public UUID getId() {
    try {
      return UUID.fromString(identity.getAttribute("id"));
    } catch (Exception e) {
      throw new ForbiddenException("Invalid user, all users must have an id");
    }
  }

  public String getUsername() {
    try {
      return identity.getPrincipal().getName();
    } catch (Exception e) {
      throw new ForbiddenException("Invalid user, all users must have a username");
    }
  }
  
}
