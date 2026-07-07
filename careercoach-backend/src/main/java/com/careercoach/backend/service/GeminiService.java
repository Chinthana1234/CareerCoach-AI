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

    public String generateNextInterviewQuestion(String jobTitle, String conversationHistory) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not set. Falling back to service-level mock question.");
            return null; // Return null so the service knows to use its local mock question list
        }

        try {
            String prompt = "You are an expert HR interviewer conducting a mock interview for a candidate applying for the position of: " + jobTitle + ".\n" +
                    "Here is the dialogue history of the interview so far:\n" +
                    conversationHistory + "\n" +
                    "Based on this history, generate the next single HR behavioral or professional question. " +
                    "Do not include any headers, instructions, or multiple options. Return ONLY the question text.";

            return callGeminiApi(prompt, false);
        } catch (Exception e) {
            log.error("Error calling Gemini for next question, falling back", e);
            return null;
        }
    }

    public String evaluateInterviewSession(String jobTitle, String conversationHistory) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not set. Falling back to mock interview evaluation.");
            return getMockEvaluationJson();
        }

        try {
            String prompt = "You are an expert HR interviewer. You have just completed a mock interview for the position of: " + jobTitle + ".\n" +
                    "Evaluate the dialogue history between the AI interviewer and the candidate:\n" +
                    conversationHistory + "\n" +
                    "Analyze the candidate's performance based on the following metrics: Confidence, Grammar, Communication, and Professionalism.\n" +
                    "Provide score values (0 to 100) and construct constructive overall feedback.\n" +
                    "Do not return any conversational text outside the JSON block.\n\n" +
                    "Required JSON format:\n" +
                    "{\n" +
                    "  \"overallScore\": <integer, 0-100>,\n" +
                    "  \"confidenceScore\": <integer, 0-100>,\n" +
                    "  \"grammarScore\": <integer, 0-100>,\n" +
                    "  \"communicationScore\": <integer, 0-100>,\n" +
                    "  \"professionalismScore\": <integer, 0-100>,\n" +
                    "  \"feedback\": \"<detailed constructive summary text highlighting strengths and specific areas of improvements>\"\n" +
                    "}";

            return callGeminiApi(prompt, true);
        } catch (Exception e) {
            log.error("Error calling Gemini for interview evaluation, falling back", e);
            return getMockEvaluationJson();
        }
    }

    private String callGeminiApi(String prompt, boolean isJson) throws Exception {
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentPart = Map.of("parts", java.util.List.of(textPart));
        
        Map<String, Object> requestBody;
        if (isJson) {
            Map<String, Object> configPart = Map.of("responseMimeType", "application/json");
            requestBody = Map.of(
                    "contents", java.util.List.of(contentPart),
                    "generationConfig", configPart
            );
        } else {
            requestBody = Map.of(
                    "contents", java.util.List.of(contentPart)
            );
        }

        String requestBodyJson = objectMapper.writeValueAsString(requestBody);
        URI uri = URI.create(apiUrl + "?key=" + apiKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to call Gemini API: " + response.statusCode());
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
        throw new RuntimeException("Invalid response structure from Gemini API");
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

    private String getMockEvaluationJson() {
        return "{\n" +
                "  \"overallScore\": 82,\n" +
                "  \"confidenceScore\": 85,\n" +
                "  \"grammarScore\": 88,\n" +
                "  \"communicationScore\": 80,\n" +
                "  \"professionalismScore\": 75,\n" +
                "  \"feedback\": \"You did a fantastic job explaining your project work and handled team dynamic questions with great self-awareness. To improve, work on structuring your answers using the STAR method more tightly, specifically expanding on the measurable Results. Your vocabulary was highly professional, though you could sound a bit more relaxed and confident during structural transitions.\"\n" +
                "}";
    }

    public String generateNextTechnicalQuestion(String topic, String conversationHistory) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not set. Falling back to service-level mock question.");
            return null; // Return null so the service knows to use its local mock question list
        }

        try {
            String prompt = "You are an expert technical interviewer conducting a mock interview on the topic: " + topic + ".\n" +
                    "Here is the dialogue history of the interview so far:\n" +
                    conversationHistory + "\n" +
                    "Based on this history, generate the next single technical question. " +
                    "Ensure the question is professional, challenging, and strictly tests core concepts of " + topic + ".\n" +
                    "Do not include any headers, instructions, or multiple options. Return ONLY the question text.";

            return callGeminiApi(prompt, false);
        } catch (Exception e) {
            log.error("Error calling Gemini for next technical question, falling back", e);
            return null;
        }
    }

    public String evaluateTechnicalInterviewSession(String topic, String conversationHistory) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not set. Falling back to mock technical evaluation.");
            return getMockTechnicalEvaluationJson(topic);
        }

        try {
            String prompt = "You are an expert technical interviewer. You have just completed a technical mock interview on the topic: " + topic + ".\n" +
                    "Evaluate the dialogue history between the AI interviewer and the candidate:\n" +
                    conversationHistory + "\n" +
                    "Analyze the candidate's performance based on the following metrics: Technical Accuracy (mapped to Professionalism score), Confidence, Grammar, Communication.\n" +
                    "Provide score values (0 to 100) and construct constructive overall feedback.\n" +
                    "Do not return any conversational text outside the JSON block.\n\n" +
                    "Required JSON format:\n" +
                    "{\n" +
                    "  \"overallScore\": <integer, 0-100>,\n" +
                    "  \"confidenceScore\": <integer, 0-100>,\n" +
                    "  \"grammarScore\": <integer, 0-100>,\n" +
                    "  \"communicationScore\": <integer, 0-100>,\n" +
                    "  \"professionalismScore\": <integer, 0-100, representing Technical Accuracy and depth of topic knowledge>,\n" +
                    "  \"feedback\": \"<detailed constructive summary text highlighting technical strengths, correcting technical mistakes, and specific areas of improvements in " + topic + ">\"\n" +
                    "}";

            return callGeminiApi(prompt, true);
        } catch (Exception e) {
            log.error("Error calling Gemini for technical interview evaluation, falling back", e);
            return getMockTechnicalEvaluationJson(topic);
        }
    }

    private String getMockTechnicalEvaluationJson(String topic) {
        return "{\n" +
                "  \"overallScore\": 84,\n" +
                "  \"confidenceScore\": 80,\n" +
                "  \"grammarScore\": 90,\n" +
                "  \"communicationScore\": 85,\n" +
                "  \"professionalismScore\": 82,\n" +
                "  \"feedback\": \"You demonstrated solid knowledge of " + topic + " concepts in your answers. Your explanations of core syntax and principles were clean. To improve further, focus on referencing real-world design pattern applications or performance implications (such as memory management and execution complexity) in your explanations. Great technical understanding overall!\"\n" +
                "}";
    }
}
