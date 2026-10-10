package com.careercoach.backend.repository;

import com.careercoach.backend.entity.CvChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CvChunkRepository extends JpaRepository<CvChunk, Long> {
    
    @Modifying
    @Query("DELETE FROM CvChunk c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    // Similarity search query will be added later for ChatService. 
    // Right now, we just need basic saving and deleting by user.
}
