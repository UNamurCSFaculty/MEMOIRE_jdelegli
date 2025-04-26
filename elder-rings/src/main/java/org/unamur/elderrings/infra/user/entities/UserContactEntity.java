package org.unamur.elderrings.infra.user.entities;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("Represents a user contact relationship in the system")
@Table(name = "app_user_contact", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"id"})
})
public class UserContactEntity {

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_a_id", nullable = false)
  private UserEntity userA;
    
  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_b_id", nullable = false)
  private UserEntity userB;
  
}
