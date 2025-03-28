package org.unamur.elderrings.infra.user.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.unamur.elderrings.infra.user.entities.UserEntity;
import org.unamur.elderrings.infra.user.entities.UserPictureEntity;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@ApplicationScoped
@AllArgsConstructor
public class UserRepository implements PanacheRepository<UserEntity>  {

  private final UserPictureRepository userPictureRepository; 

  // Get user by id
  public Optional<UserEntity> getUserById(UUID id) {
    return find("id", id).firstResultOptional();  // Panache's findById() returns null if not found
  }

  public void saveUser(UserEntity userEntity) {
    persist(userEntity);
  }

  // Update user by ID
  @Transactional
  public UserEntity createOrUpdateUser(UUID id, String username, String firstname, String lastname, Boolean isRoom) {
    
    // Find the user by ID
    Optional<UserEntity> userOpt = getUserById(id);

    if (userOpt.isPresent()) {
      UserEntity user = userOpt.get();
          
      // Update fields
      user.setUsername(username);
      user.setFirstName(firstname);
      user.setLastName(lastname);
      user.setIsRoom(isRoom);
          
      // Persist the updated user entity
      persist(user);
      return user;
    } else {
      UserEntity user = new UserEntity();

      // set fields
      user.setId(id);
      user.setUsername(username);
      user.setFirstName(firstname);
      user.setLastName(lastname);
      user.setIsRoom(isRoom);


      // Create user entity
      persist(user);
      return user;
    }
  }

  @Transactional
  public UUID setUserPicture(UUID userId, byte[] image) {
    Optional<UserEntity> userOpt = getUserById(userId);  // Fetch the user by ID
    if (userOpt.isPresent()) {
      UserEntity user = userOpt.get();
      UserPictureEntity userPicture = new UserPictureEntity();
      userPicture.setImage(image);
      userPictureRepository.persistAndFlush(userPicture);
      user.setPicture(userPicture);  // Assuming you've set up a setProfilePicture method in UserEntity
      persist(user);  // Save the updated user with the new profile picture
      return userPicture.getId();
    } else {
      throw new IllegalArgumentException("User not found");
    }
  }

  public Optional<UserPictureEntity> getUserPicture(UUID userId) {
    return find("id", userId)
        .firstResultOptional()
        .map(UserEntity::getPicture);
  }

  public List<UserEntity> findAllVisibleUsersExcluding(UUID excludedUserId) {
    return find("""
        SELECT u FROM UserEntity u
        WHERE u.preferences.general.isPublic = true
        AND u.id <> ?1
    """, excludedUserId).list();
}
  
}
