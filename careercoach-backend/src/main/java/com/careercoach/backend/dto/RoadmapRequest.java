package com.careercoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapRequest {
    @NotBlank(message = "Role is required")
    private String role; // e.g. Frontend, Backend, Full Stack, DevOps, AI Engineer
}
