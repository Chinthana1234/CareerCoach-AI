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
    public ResponseEntity<List<RoadmapResponse>> getHistory(Principal principal) {
        return ResponseEntity.ok(roadmapService.getHistory(principal.getName()));
    }
}
