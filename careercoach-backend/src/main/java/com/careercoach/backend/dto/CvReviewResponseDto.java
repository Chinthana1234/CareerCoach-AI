package com.careercoach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvReviewResponseDto {
    private Long id;
    private Long cvDocumentId;
    private Integer overallScore;
    private String grammar;
    private Integer atsScore;
    private List<String> skills;
    private List<String> projects;
    private List<String> missingSections;
    private List<String> suggestions;
    private LocalDateTime createdAt;
}
