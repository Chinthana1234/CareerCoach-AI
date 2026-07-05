package com.careercoach.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_document_id", nullable = false, unique = true)
    private CvDocument cvDocument;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "grammar", columnDefinition = "TEXT")
    private String grammar;

    @Column(name = "ats_score", nullable = false)
    private Integer atsScore;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "projects", columnDefinition = "TEXT")
    private String projects;

    @Column(name = "missing_sections", columnDefinition = "TEXT")
    private String missingSections;

    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
