package com.careercoach.backend.repository;

import com.careercoach.backend.entity.LinkedinReview;
import com.careercoach.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkedinReviewRepository extends JpaRepository<LinkedinReview, Long> {
    List<LinkedinReview> findByUserOrderByCreatedAtDesc(User user);
}
