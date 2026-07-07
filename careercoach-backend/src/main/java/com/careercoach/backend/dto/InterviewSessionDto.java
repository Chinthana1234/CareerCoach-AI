package com.careercoach.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDto {
    private UUID id;
    private String jobTitle;
    private String status;
    private String interviewType;
    private String topic;
    private Integer currentQuestionIndex;
    private Integer overallScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer communicationScore;
    private Integer professionalismScore;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
