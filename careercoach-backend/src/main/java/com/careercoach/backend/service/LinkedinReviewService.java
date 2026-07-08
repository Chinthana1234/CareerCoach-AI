package com.careercoach.backend.service;

import com.careercoach.backend.dto.LinkedinReviewRequest;
import com.careercoach.backend.dto.LinkedinReviewResponse;
import com.careercoach.backend.entity.LinkedinReview;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.LinkedinReviewRepository;
import com.careercoach.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LinkedinReviewService {

    private final LinkedinReviewRepository linkedinReviewRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public LinkedinReviewResponse createReview(String username, LinkedinReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String jsonResponse = geminiService.generateLinkedinReview(request.getHeadline(), request.getAbout(), request.getExperience());

        String suggestions = "";
        String improvedProfile = "";

        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            if (rootNode.has("suggestions")) {
                suggestions = rootNode.get("suggestions").asText();
            }
            if (rootNode.has("improvedProfile")) {
                improvedProfile = rootNode.get("improvedProfile").asText();
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini JSON response for Linkedin Review: {}", jsonResponse, e);
            throw new RuntimeException("Failed to generate LinkedIn review");
        }

        LinkedinReview review = LinkedinReview.builder()
                .user(user)
                .headline(request.getHeadline())
                .about(request.getAbout())
                .experience(request.getExperience())
                .suggestions(suggestions)
                .improvedProfile(improvedProfile)
                .build();

        LinkedinReview savedReview = linkedinReviewRepository.save(review);

        return mapToResponse(savedReview);
    }

    public List<LinkedinReviewResponse> getUserReviews(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return linkedinReviewRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LinkedinReviewResponse mapToResponse(LinkedinReview review) {
        return LinkedinReviewResponse.builder()
                .id(review.getId())
                .headline(review.getHeadline())
                .about(review.getAbout())
                .experience(review.getExperience())
                .suggestions(review.getSuggestions())
                .improvedProfile(review.getImprovedProfile())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
