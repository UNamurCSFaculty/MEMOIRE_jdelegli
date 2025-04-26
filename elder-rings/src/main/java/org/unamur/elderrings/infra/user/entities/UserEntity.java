package org.unamur.elderrings.infra.user.entities;

import java.util.UUID;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("Represents a user in the system")
@Table(name = "app_user", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"id"})
})
public class UserEntity {

  @Id
  @Column(name="id", unique = true, nullable = false)
  protected UUID id;

  @Column(name="username")
  protected String username;

  @Column(name="first_name")
  protected String firstName;

  @Column(name="last_name")
  protected String lastName;

  @Column(name="is_room")
  protected Boolean isRoom;

  @OneToOne
  @JoinColumn(name = "picture_id", nullable = true)
  private UserPictureEntity picture; // Foreign key to associate with the user

  @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
  private UserPreferencesEntity preferences;
  
}
