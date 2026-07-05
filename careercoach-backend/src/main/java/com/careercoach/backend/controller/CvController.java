package com.careercoach.backend.controller;

import com.careercoach.backend.entity.CvDocument;
import com.careercoach.backend.repository.CvDocumentRepository;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.UserRepository;
import com.careercoach.backend.service.CvService;
import com.careercoach.backend.service.CvReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CvController {

    private final CvService cvService;
    private final CvDocumentRepository cvDocumentRepository;
    private final UserRepository userRepository;
    private final CvReviewService cvReviewService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCv(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            CvDocument doc = cvService.uploadAndExtract(principal.getName(), file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", doc.getId());
            response.put("fileName", doc.getFileName());
            response.put("fileSize", doc.getFileSize());
            response.put("extractedText", doc.getExtractedText());
            response.put("createdAt", doc.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to process CV upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestCv(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal.getName()));
                
        Optional<CvDocument> latestOpt = cvDocumentRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        if (latestOpt.isPresent()) {
            CvDocument doc = latestOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", doc.getId());
            response.put("fileName", doc.getFileName());
            response.put("fileSize", doc.getFileSize());
            response.put("extractedText", doc.getExtractedText());
            response.put("createdAt", doc.getCreatedAt());
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/review/{cvId}")
    public ResponseEntity<?> reviewCv(@PathVariable("cvId") Long cvId, Principal principal) {
        try {
            return ResponseEntity.ok(cvReviewService.reviewCv(principal.getName(), cvId));
        } catch (IllegalArgumentException | SecurityException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to analyze CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/review/latest")
    public ResponseEntity<?> getLatestReview(Principal principal) {
        try {
            return ResponseEntity.ok(cvReviewService.getLatestReview(principal.getName()));
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to retrieve latest CV review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}
