package com.careercoach.backend.service;

import com.careercoach.backend.dto.CvReviewResponseDto;
import com.careercoach.backend.entity.CvDocument;
import com.careercoach.backend.entity.CvReview;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.CvDocumentRepository;
import com.careercoach.backend.repository.CvReviewRepository;
import com.careercoach.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvReviewService {

    private final CvDocumentRepository cvDocumentRepository;
    private final CvReviewRepository cvReviewRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public CvReviewResponseDto reviewCv(String username, Long cvId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        CvDocument cvDocument = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("CV document not found: " + cvId));

        if (!cvDocument.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to CV document");
        }

        String reviewJsonStr = geminiService.generateReviewJson(cvDocument.getExtractedText());

        Integer overallScore = 70;
        String grammar = "No grammar review generated.";
        Integer atsScore = 70;
        String skillsJson = "[]";
        String projectsJson = "[]";
        String missingSectionsJson = "[]";
        String suggestionsJson = "[]";

        try {
            JsonNode root = objectMapper.readTree(reviewJsonStr);
            if (root.has("overallScore")) overallScore = root.get("overallScore").asInt();
            if (root.has("grammar")) grammar = root.get("grammar").asText();
            if (root.has("atsScore")) atsScore = root.get("atsScore").asInt();
            
            if (root.has("skills")) skillsJson = objectMapper.writeValueAsString(root.get("skills"));
            if (root.has("projects")) projectsJson = objectMapper.writeValueAsString(root.get("projects"));
            if (root.has("missingSections")) missingSectionsJson = objectMapper.writeValueAsString(root.get("missingSections"));
            if (root.has("suggestions")) suggestionsJson = objectMapper.writeValueAsString(root.get("suggestions"));
        } catch (Exception e) {
            log.error("Failed to parse Gemini review JSON: {}", reviewJsonStr, e);
        }

        Optional<CvReview> existingReviewOpt = cvReviewRepository.findByCvDocumentId(cvId);
        CvReview cvReview;
        if (existingReviewOpt.isPresent()) {
            cvReview = existingReviewOpt.get();
            cvReview.setOverallScore(overallScore);
            cvReview.setGrammar(grammar);
            cvReview.setAtsScore(atsScore);
            cvReview.setSkills(skillsJson);
            cvReview.setProjects(projectsJson);
            cvReview.setMissingSections(missingSectionsJson);
            cvReview.setSuggestions(suggestionsJson);
        } else {
            cvReview = CvReview.builder()
                    .cvDocument(cvDocument)
                    .overallScore(overallScore)
                    .grammar(grammar)
                    .atsScore(atsScore)
                    .skills(skillsJson)
                    .projects(projectsJson)
                    .missingSections(missingSectionsJson)
                    .suggestions(suggestionsJson)
                    .build();
        }

        cvReview = cvReviewRepository.save(cvReview);

        return mapToDto(cvReview);
    }

    @Transactional(readOnly = true)
    public CvReviewResponseDto getLatestReview(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        CvReview review = cvReviewRepository.findFirstByCvDocumentUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No CV review found for user: " + username));

        return mapToDto(review);
    }

    @Transactional(readOnly = true)
    public List<CvReviewResponseDto> getAllReviews(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<CvReview> reviews = cvReviewRepository.findAllByCvDocumentUserIdOrderByCreatedAtDesc(user.getId());
        return reviews.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public void deleteReview(String username, Long reviewId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        CvReview review = cvReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (!review.getCvDocument().getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to delete review");
        }

        cvReviewRepository.delete(review);
    }

    private CvReviewResponseDto mapToDto(CvReview review) {
        return CvReviewResponseDto.builder()
                .id(review.getId())
                .cvDocumentId(review.getCvDocument().getId())
                .overallScore(review.getOverallScore())
                .grammar(review.getGrammar())
                .atsScore(review.getAtsScore())
                .skills(parseJsonArray(review.getSkills()))
                .projects(parseJsonArray(review.getProjects()))
                .missingSections(parseJsonArray(review.getMissingSections()))
                .suggestions(parseJsonArray(review.getSuggestions()))
                .createdAt(review.getCreatedAt())
                .build();
    }

    private List<String> parseJsonArray(String jsonArrayStr) {
        if (jsonArrayStr == null || jsonArrayStr.trim().isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(jsonArrayStr, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Failed to parse JSON array string: {}", jsonArrayStr, e);
            return List.of(jsonArrayStr);
        }
    }
}
