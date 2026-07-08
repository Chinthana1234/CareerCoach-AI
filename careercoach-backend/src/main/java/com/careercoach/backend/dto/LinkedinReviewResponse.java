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
public class LinkedinReviewResponse {
    private Long id;
    private String headline;
    private String about;
    private String experience;
    private String suggestions;
    private String improvedProfile;
    private LocalDateTime createdAt;
}
