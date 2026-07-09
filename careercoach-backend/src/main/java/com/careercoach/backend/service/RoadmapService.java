package com.careercoach.backend.service;

import com.careercoach.backend.dto.RoadmapRequest;
import com.careercoach.backend.dto.RoadmapResponse;
import com.careercoach.backend.entity.CareerRoadmap;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.CareerRoadmapRepository;
import com.careercoach.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    private final UserRepository userRepository;
    private final CareerRoadmapRepository roadmapRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public RoadmapResponse generateRoadmap(String username, RoadmapRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rawJson = geminiService.generateCareerRoadmap(request.getRole());
        
        String timelineStr = "[]";
        String projectsStr = "[]";
        
        try {
            JsonNode rootNode = objectMapper.readTree(rawJson);
            if (rootNode.has("timeline")) {
                timelineStr = rootNode.get("timeline").toString();
            }
            if (rootNode.has("projects")) {
                projectsStr = rootNode.get("projects").toString();
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini roadmap JSON", e);
            throw new RuntimeException("Failed to generate roadmap format.");
        }

        CareerRoadmap roadmap = CareerRoadmap.builder()
                .user(user)
                .role(request.getRole())
                .timelineJson(timelineStr)
                .projectsJson(projectsStr)
                .build();

        roadmap = roadmapRepository.save(roadmap);

        return mapToResponse(roadmap);
    }

    public List<RoadmapResponse> getHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CareerRoadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return roadmaps.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private RoadmapResponse mapToResponse(CareerRoadmap roadmap) {
        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .role(roadmap.getRole())
                .timelineJson(roadmap.getTimelineJson())
                .projectsJson(roadmap.getProjectsJson())
                .createdAt(roadmap.getCreatedAt())
                .build();
    }
}
