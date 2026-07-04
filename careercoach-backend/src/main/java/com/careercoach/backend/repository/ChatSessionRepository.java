package com.careercoach.backend.repository;

import com.careercoach.backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatSession s SET s.updatedAt = CURRENT_TIMESTAMP WHERE s.id = :id")
    void updateSessionTimestamp(UUID id);
}
