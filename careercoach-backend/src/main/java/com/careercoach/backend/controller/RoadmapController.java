package com.careercoach.backend.controller;

import com.careercoach.backend.dto.RoadmapRequest;
import com.careercoach.backend.dto.RoadmapResponse;
import com.careercoach.backend.service.RoadmapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")
    public ResponseEntity<RoadmapResponse> generateRoadmap(
            @Valid @RequestBody RoadmapRequest request,
            Principal principal) {
        return ResponseEntity.ok(roadmapService.generateRoadmap(principal.getName(), request));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Principal principal) {
        try {
            return ResponseEntity.ok(roadmapService.getHistory(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoadmap(@PathVariable Long id, Principal principal) {
        try {
            roadmapService.deleteRoadmap(principal.getName(), id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
