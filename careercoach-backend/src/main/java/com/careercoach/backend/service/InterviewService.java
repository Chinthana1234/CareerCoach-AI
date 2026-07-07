package com.careercoach.backend.service;

import com.careercoach.backend.dto.InterviewMessageDto;
import com.careercoach.backend.dto.InterviewSessionDto;
import com.careercoach.backend.entity.InterviewMessage;
import com.careercoach.backend.entity.InterviewSession;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.InterviewMessageRepository;
import com.careercoach.backend.repository.InterviewSessionRepository;
import com.careercoach.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final int MAX_QUESTIONS = 4;

    private static final List<String> MOCK_QUESTIONS = List.of(
            "Welcome! Let's start the HR Mock Interview. Could you please introduce yourself and tell me why you are interested in a career as a %s?",
            "Great. Now, describe a challenging project or situation you encountered. What obstacles did you face, and how did you overcome them?",
            "Conflict resolution is key in any team. Tell me about a time you had a conflict or disagreement with a coworker or classmate. How did you resolve it?",
            "Lastly, where do you see yourself in 5 years, and how does this role align with your long-term career aspirations?"
    );

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Transactional
    public InterviewSessionDto createSession(String username, String jobTitle) {
        User user = getUserByUsername(username);

        String title = (jobTitle == null || jobTitle.trim().isEmpty()) ? "Software Developer" : jobTitle.trim();

        // 1. Create session
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .jobTitle(title)
                .status("IN_PROGRESS")
                .currentQuestionIndex(0)
                .build();

        session = sessionRepository.save(session);

        // 2. Add first question (AI)
        String firstQuestion = String.format(MOCK_QUESTIONS.get(0), title);
        
        InterviewMessage firstMessage = InterviewMessage.builder()
                .session(session)
                .sender("AI")
                .content(firstQuestion)
                .build();

        messageRepository.save(firstMessage);

        return mapToDto(session);
    }

    @Transactional
    public InterviewSessionDto submitAnswer(String username, UUID sessionId, String answer) {
        User user = getUserByUsername(username);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to interview session");
        }

        if ("COMPLETED".equals(session.getStatus())) {
            throw new IllegalStateException("This interview session has already been completed");
        }

        // 1. Save user's answer
        InterviewMessage userMessage = InterviewMessage.builder()
                .session(session)
                .sender("USER")
                .content(answer)
                .build();
        messageRepository.save(userMessage);

        // 2. Increment question index
        int nextIndex = session.getCurrentQuestionIndex() + 1;
        session.setCurrentQuestionIndex(nextIndex);

        List<InterviewMessage> allMessages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        String history = formatHistory(allMessages);

        if (nextIndex >= MAX_QUESTIONS) {
            // End of interview: Evaluate using Gemini
            session.setStatus("COMPLETED");

            String evaluationJson = geminiService.evaluateInterviewSession(session.getJobTitle(), history);
            parseAndApplyEvaluation(session, evaluationJson);

            // Add final AI thank-you / completion message
            String completionMsg = "Thank you for completing the interview! I have evaluated your responses. " +
                    "Your overall score is " + session.getOverallScore() + "/100. Feel free to review the details below.";
            InterviewMessage completeMessage = InterviewMessage.builder()
                    .session(session)
                    .sender("AI")
                    .content(completionMsg)
                    .build();
            messageRepository.save(completeMessage);

        } else {
            // Next question: Generate via Gemini or load from mock questions
            String nextQuestion = geminiService.generateNextInterviewQuestion(session.getJobTitle(), history);
            if (nextQuestion == null || nextQuestion.trim().isEmpty()) {
                nextQuestion = String.format(MOCK_QUESTIONS.get(nextIndex), session.getJobTitle());
            }

            InterviewMessage nextMessage = InterviewMessage.builder()
                    .session(session)
                    .sender("AI")
                    .content(nextQuestion)
                    .build();
            messageRepository.save(nextMessage);
        }

        session = sessionRepository.save(session);
        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public InterviewSessionDto getSession(String username, UUID sessionId) {
        User user = getUserByUsername(username);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to interview session");
        }

        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public List<InterviewMessageDto> getMessages(String username, UUID sessionId) {
        User user = getUserByUsername(username);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to interview session");
        }

        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(msg -> InterviewMessageDto.builder()
                        .id(msg.getId())
                        .sender(msg.getSender())
                        .content(msg.getContent())
                        .createdAt(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionDto> getHistory(String username) {
        User user = getUserByUsername(username);
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private String formatHistory(List<InterviewMessage> messages) {
        StringBuilder sb = new StringBuilder();
        for (InterviewMessage msg : messages) {
            sb.append(msg.getSender()).append(": ").append(msg.getContent()).append("\n\n");
        }
        return sb.toString();
    }

    private void parseAndApplyEvaluation(InterviewSession session, String evaluationJson) {
        try {
            JsonNode node = objectMapper.readTree(evaluationJson);
            session.setOverallScore(node.path("overallScore").asInt(70));
            session.setConfidenceScore(node.path("confidenceScore").asInt(70));
            session.setGrammarScore(node.path("grammarScore").asInt(70));
            session.setCommunicationScore(node.path("communicationScore").asInt(70));
            session.setProfessionalismScore(node.path("professionalismScore").asInt(70));
            session.setFeedback(node.path("feedback").asText("Evaluation completed. No details provided."));
        } catch (Exception e) {
            log.error("Failed to parse Gemini evaluation JSON: {}", evaluationJson, e);
            session.setOverallScore(75);
            session.setConfidenceScore(75);
            session.setGrammarScore(75);
            session.setCommunicationScore(75);
            session.setProfessionalismScore(75);
            session.setFeedback("Evaluation succeeded but parsing response failed. Great attempt overall!");
        }
    }

    private InterviewSessionDto mapToDto(InterviewSession session) {
        return InterviewSessionDto.builder()
                .id(session.getId())
                .jobTitle(session.getJobTitle())
                .status(session.getStatus())
                .currentQuestionIndex(session.getCurrentQuestionIndex())
                .overallScore(session.getOverallScore())
                .confidenceScore(session.getConfidenceScore())
                .grammarScore(session.getGrammarScore())
                .communicationScore(session.getCommunicationScore())
                .professionalismScore(session.getProfessionalismScore())
                .feedback(session.getFeedback())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .interviewType(session.getInterviewType())
                .topic(session.getTopic())
                .build();
    }
}
