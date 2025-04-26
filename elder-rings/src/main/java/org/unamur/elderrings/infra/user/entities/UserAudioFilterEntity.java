package org.unamur.elderrings.infra.user.entities;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "app_user_audio_filter")
public class UserAudioFilterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "preferences_id")
    private UserPreferencesEntity preferences;

    @Column(name = "frequency", nullable = false)
    private int frequency; // 0–20,000 Hz constraint enforced in logic/validation

    @Column(name = "gain", nullable = false)
    private double gain; // Allow negative values (e.g., -20.0 to +20.0 dB)
}
