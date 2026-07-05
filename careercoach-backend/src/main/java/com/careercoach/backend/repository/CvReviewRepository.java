package com.careercoach.backend.repository;

import com.careercoach.backend.entity.CvReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CvReviewRepository extends JpaRepository<CvReview, Long> {
    Optional<CvReview> findByCvDocumentId(Long cvDocumentId);
    Optional<CvReview> findFirstByCvDocumentUserIdOrderByCreatedAtDesc(Long userId);
}
