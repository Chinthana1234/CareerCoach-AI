package com.careercoach.backend.controller;

import com.careercoach.backend.dto.LinkedinReviewRequest;
import com.careercoach.backend.dto.LinkedinReviewResponse;
import com.careercoach.backend.service.LinkedinReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/linkedin")
@RequiredArgsConstructor
public class LinkedinReviewController {

    private final LinkedinReviewService linkedinReviewService;

    @PostMapping("/review")
    public ResponseEntity<LinkedinReviewResponse> submitReview(
            @RequestBody LinkedinReviewRequest request,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(linkedinReviewService.createReview(userDetails.getUsername(), request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<LinkedinReviewResponse>> getReviewHistory(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(linkedinReviewService.getUserReviews(userDetails.getUsername()));
    }
}
