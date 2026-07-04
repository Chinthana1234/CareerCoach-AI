package com.careercoach.backend.repository;

import com.careercoach.backend.entity.CvDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvDocumentRepository extends JpaRepository<CvDocument, Long> {
    List<CvDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CvDocument> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
