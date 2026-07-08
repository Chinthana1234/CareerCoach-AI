package com.careercoach.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "linkedin_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedinReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "headline", columnDefinition = "TEXT")
    private String headline;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "improved_profile", columnDefinition = "TEXT")
    private String improvedProfile;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
