package org.unamur.elderrings.infra.user.entities;

import java.util.UUID;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("Store the user image displayed to the contacts in the system")
@Table(name = "app_user_picture", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"id"})
})
public class UserPictureEntity {
  
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "image", columnDefinition = "BYTEA")
  private byte[] image;

}
