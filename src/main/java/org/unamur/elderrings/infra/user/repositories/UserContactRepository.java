package org.unamur.elderrings.infra.user.repositories;

import java.util.List;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserContactEntity;
import org.unamur.elderrings.infra.user.entities.UserEntity;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.AllArgsConstructor;

@ApplicationScoped
@AllArgsConstructor
public class UserContactRepository implements PanacheRepository<UserContactEntity>  {

  public List<UserEntity> findContactsByUserId(UUID userId) {
    return find("userA.id = ?1 OR userB.id = ?1", userId)
        .stream()
        .map(contact -> contact.getUserA().getId().equals(userId) ? contact.getUserB() : contact.getUserA())
        .toList();
}

  public boolean existsContact(UUID userAId, UUID userBId) {
    return count("(userA.id = ?1 AND userB.id = ?2) OR (userA.id = ?2 AND userB.id = ?1)", userAId, userBId) > 0;
  }

  public void createContact(UserEntity userA, UserEntity userB) {
    if (!existsContact(userA.getId(), userB.getId())) {
      UserContactEntity contact = new UserContactEntity();
        contact.setUserA(userA);
        contact.setUserB(userB);
        persist(contact);
    }
}
  
}
