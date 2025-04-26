package org.unamur.elderrings.infra.user.entities;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "app_user_preferences")
public class UserPreferencesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Embedded
    private GeneralPreferencesEmbeddableEntity general = new GeneralPreferencesEmbeddableEntity();

    @Embedded
    private VisualPreferencesEmbeddableEntity visual = new VisualPreferencesEmbeddableEntity();

    @Embedded
    private AudioPreferencesEmbeddableEntity audio = new AudioPreferencesEmbeddableEntity();

    @OneToMany(mappedBy = "preferences", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAudioFilterEntity> filters = new ArrayList<>();
}
