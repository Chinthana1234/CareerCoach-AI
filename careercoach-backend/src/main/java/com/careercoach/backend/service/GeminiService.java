package com.careercoach.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String generateReviewJson(String cvText) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not set. Using simulated mock review response.");
            return getMockReviewJson();
        }

        try {
            String prompt = "You are an expert ATS (Applicant Tracking System) optimizer and professional CV reviewer.\n" +
                    "Analyze the following extracted text from a candidate's CV/resume.\n" +
                    "Provide a detailed assessment by completing the JSON response structure.\n" +
                    "Do not return any conversational text outside the JSON block.\n\n" +
                    "Required JSON format:\n" +
                    "{\n" +
                    "  \"overallScore\": <integer, 0-100>,\n" +
                    "  \"grammar\": \"<text summarizing grammar quality, typos, and phrasing recommendations>\",\n" +
                    "  \"atsScore\": <integer, 0-100>,\n" +
                    "  \"skills\": [\"<skill 1>\", \"<skill 2>\", ...],\n" +
                    "  \"projects\": [\"<project name and brief review of its presentation>\", ...],\n" +
                    "  \"missingSections\": [\"<missing section name>\", ...],\n" +
                    "  \"suggestions\": [\"<actionable recommendation 1>\", \"<actionable recommendation 2>\", ...]\n" +
                    "}\n\n" +
                    "Extracted CV text:\n" +
                    cvText;

            // Build request body for Gemini 1.5
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentPart = Map.of("parts", java.util.List.of(textPart));
            Map<String, Object> configPart = Map.of("responseMimeType", "application/json");
            Map<String, Object> requestBody = Map.of(
                    "contents", java.util.List.of(contentPart),
                    "generationConfig", configPart
            );

            String requestBodyJson = objectMapper.writeValueAsString(requestBody);

            URI uri = URI.create(apiUrl + "?key=" + apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API returned error code {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to call Gemini API, status code: " + response.statusCode());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidates = rootNode.get("candidates");
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        return parts.get(0).get("text").asText();
                    }
                }
            }

            throw new RuntimeException("Invalid response structure from Gemini API: " + response.body());

        } catch (Exception e) {
            log.error("Error communicating with Gemini API, falling back to mock response", e);
            return getMockReviewJson();
        }
    }

    private String getMockReviewJson() {
        return "{\n" +
                "  \"overallScore\": 78,\n" +
                "  \"grammar\": \"Excellent grammar overall. Found 1 minor issue: consider using active verbs rather than passive ones (e.g., 'Led implementation' instead of 'Was responsible for implementing').\",\n" +
                "  \"atsScore\": 72,\n" +
                "  \"skills\": [\"Java\", \"Spring Boot\", \"REST APIs\", \"Hibernate/JPA\", \"PostgreSQL\", \"React\", \"Git\"],\n" +
                "  \"projects\": [\"Developed e-commerce backend with Spring Boot - Good description, but needs quantified results.\", \"Task Manager with React - Nice state management layout description.\"],\n" +
                "  \"missingSections\": [\"Certifications\", \"Professional Summary/Profile Statement\"],\n" +
                "  \"suggestions\": [\"Quantify your achievements: instead of saying 'Improved page load speed', say 'Improved page load speed by 35%'.\", \"Add a professional summary at the top to describe your career objectives and core competencies.\", \"Incorporate key target job keywords like 'Microservices' and 'Docker' to improve the ATS Score.\"]\n" +
                "}";
    }
}
