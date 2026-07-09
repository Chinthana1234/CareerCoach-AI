package com.careercoach.backend.repository;

import com.careercoach.backend.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, Long> {
    List<CareerRoadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
}
