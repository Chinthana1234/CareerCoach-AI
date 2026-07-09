package com.careercoach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapResponse {
    private Long id;
    private String role;
    private String timelineJson;
    private String projectsJson;
    private LocalDateTime createdAt;
}
