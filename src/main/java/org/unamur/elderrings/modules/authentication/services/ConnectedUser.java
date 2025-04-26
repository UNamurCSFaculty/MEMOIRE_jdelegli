package org.unamur.elderrings.modules.authentication.services;

import java.util.Set;
import java.util.UUID;

import org.eclipse.microprofile.jwt.JsonWebToken;

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
      JsonWebToken principal = (JsonWebToken) identity.getPrincipal();
      return UUID.fromString(principal.getSubject());
    } catch (Exception e) {
      throw new ForbiddenException("Invalid user, all users must have an ID");
    }     
  }

  public String getUsername() {
    // Retrieves the username, typically "preferred_username" or "sub" in the token; mandatory
    return getMandatoryClaim("preferred_username", "Invalid user, all users must have a username");
  }

  public String getGivenName() {
    // Retrieves the given name (first name); optional
    return getOptionalClaim("given_name");
  }

  public String getFamilyName() {
    // Retrieves the family name (last name); optional
    return getOptionalClaim("family_name");
  }

  public String getEmail() {
    // Retrieves the email address; optional
    return getOptionalClaim("email");
  }

  public boolean isRoom() {
    // Retrieves the email address; optional
    return hasRole("room");
  }

  private String getMandatoryClaim(String claimName, String errorMessage) {
    try {
      return getClaim(claimName);
    } catch (Exception e) {
      throw new ForbiddenException(errorMessage);
    }
  }

  private String getOptionalClaim(String claimName) {
    return getClaim(claimName); // Returns null if the claim is absent
  }

  private String getClaim(String claimName) {
    // Accesses claims from the JWT principal
    JsonWebToken principal = (JsonWebToken) identity.getPrincipal();
    return principal.getClaim(claimName);
  }

  public boolean hasRole(String roleName) {
    // Accesses claims from the JWT principal
    Set<String> roles = identity.getRoles();
    return roles.contains(roleName);
  }
}
