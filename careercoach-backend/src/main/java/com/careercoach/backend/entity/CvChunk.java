package com.careercoach.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "cv_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_document_id", nullable = false)
    private CvDocument cvDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "chunk_text", columnDefinition = "TEXT", nullable = false)
    private String chunkText;

    // pgvector maps well to double[] or float[]. We will use String or a custom type.
    // In pgvector-java, we can use com.pgvector.PGvector mapping if registered, but for simple saving, we can just save it as float[] mapped to vector.
    // However, Hibernate needs a specific type. Let's use string representation [1.0, 2.0, ...] and rely on Postgres casting,
    // or use float[] with proper mapping if we define the column definition.
    // For simplicity, com.pgvector provides a Hibernate 6 integration (we use Spring Boot 3.3.1 which has Hibernate 6).
    // The type should be mapped using @Column(columnDefinition = "vector").
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VECTOR)
    @Column(name = "embedding")
    private float[] embedding;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
