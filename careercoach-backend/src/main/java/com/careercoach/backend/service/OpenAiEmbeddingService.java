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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiEmbeddingService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/embeddings}")
    private String openaiApiUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public float[] getEmbedding(String text) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            log.warn("OPENAI_API_KEY is not set. Returning a dummy embedding.");
            return new float[1536]; // text-embedding-3-small size
        }

        try {
            Map<String, Object> requestBodyMap = Map.of(
                    "input", text,
                    "model", "text-embedding-3-small"
            );
            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(openaiApiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("OpenAI API returned error code {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to call OpenAI API, status code: " + response.statusCode());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode dataArray = rootNode.get("data");
            if (dataArray != null && dataArray.isArray() && dataArray.size() > 0) {
                JsonNode embeddingNode = dataArray.get(0).get("embedding");
                if (embeddingNode != null && embeddingNode.isArray()) {
                    float[] embedding = new float[embeddingNode.size()];
                    for (int i = 0; i < embeddingNode.size(); i++) {
                        embedding[i] = (float) embeddingNode.get(i).asDouble();
                    }
                    return embedding;
                }
            }

            throw new RuntimeException("Invalid response structure from OpenAI API: " + response.body());

        } catch (Exception e) {
            log.error("Error communicating with OpenAI Embedding API", e);
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }
}
