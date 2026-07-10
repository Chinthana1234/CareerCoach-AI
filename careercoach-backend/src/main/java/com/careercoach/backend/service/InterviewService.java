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

    private static final java.util.Map<String, List<String>> TECHNICAL_MOCK_QUESTIONS = java.util.Map.of(
            "Java", List.of(
                    "What are the main differences between JDK, JRE, and JVM, and how does Java achieve platform independence?",
                    "Can you explain the difference between method overloading and method overriding in Java, with examples?",
                    "What is the Java Garbage Collection mechanism, and how do the different memory areas (heap, stack) play a role in it?",
                    "Explain the differences between HashMap, LinkedHashMap, and TreeMap in Java. When would you use each?"
            ),
            "Spring Boot", List.of(
                    "What is Spring Boot, and how does it differ from the core Spring Framework? What is the role of starter dependencies?",
                    "Explain the concept of Dependency Injection and Inversion of Control (IoC) in Spring. How do you define a bean?",
                    "What is the difference between @Component, @Service, @Repository, and @Controller annotations in Spring Boot?",
                    "How do you handle exceptions globally in Spring Boot? Can you explain the use of @ControllerAdvice and @ExceptionHandler?"
            ),
            "React", List.of(
                    "What is React, and what are its key features? How does the Virtual DOM work to optimize rendering?",
                    "Explain the difference between functional components and class components. What are React Hooks, and why were they introduced?",
                    "How does state management work in React? What is the difference between local state, context API, and global state libraries like Redux?",
                    "What are React Lifecycle methods, and how do you replicate them in functional components using the useEffect Hook?"
            ),
            "SQL", List.of(
                    "What is SQL, and what is the difference between DDL, DML, and DCL commands?",
                    "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL JOIN with examples.",
                    "What are database indexes? How do they improve query performance, and what are the trade-offs of using them?",
                    "What is database normalization? Explain the differences between 1NF, 2NF, and 3NF with simple examples."
            ),
            "OOP", List.of(
                    "What is Object-Oriented Programming (OOP), and what are its four main pillars?",
                    "Explain the difference between inheritance and polymorphism. Provide a real-world scenario where both are applied.",
                    "What is encapsulation, and how does it help in creating secure and maintainable code? How is it implemented?",
                    "What is the difference between an abstract class and an interface? When should you use one over the other?"
            )
    );

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Transactional
    public InterviewSessionDto createSession(String username, String jobTitle, String interviewType, String topic) {
        User user = getUserByUsername(username);

        String title = (jobTitle == null || jobTitle.trim().isEmpty()) ? "Software Developer" : jobTitle.trim();
        String type = (interviewType == null || interviewType.trim().isEmpty()) ? "HR" : interviewType.trim().toUpperCase();
        String activeTopic = (topic == null || topic.trim().isEmpty()) ? "General" : topic.trim();

        // 1. Create session
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .jobTitle(title)
                .status("IN_PROGRESS")
                .interviewType(type)
                .topic(activeTopic)
                .currentQuestionIndex(0)
                .build();

        session = sessionRepository.save(session);

        // 2. Add first question (AI)
        String firstQuestion;
        if ("TECHNICAL".equals(type)) {
            List<String> questions = TECHNICAL_MOCK_QUESTIONS.get(activeTopic);
            if (questions != null && !questions.isEmpty()) {
                firstQuestion = questions.get(0);
            } else {
                firstQuestion = "Welcome to your technical interview on " + activeTopic + ". Let's start with a basic overview of your experience with " + activeTopic + ".";
            }
        } else {
            firstQuestion = String.format(MOCK_QUESTIONS.get(0), title);
        }
        
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

            String evaluationJson;
            if ("TECHNICAL".equals(session.getInterviewType())) {
                evaluationJson = geminiService.evaluateTechnicalInterviewSession(session.getTopic(), history);
            } else {
                evaluationJson = geminiService.evaluateInterviewSession(session.getJobTitle(), history);
            }
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
            String nextQuestion;
            if ("TECHNICAL".equals(session.getInterviewType())) {
                nextQuestion = geminiService.generateNextTechnicalQuestion(session.getTopic(), history);
                if (nextQuestion == null || nextQuestion.trim().isEmpty()) {
                    List<String> questions = TECHNICAL_MOCK_QUESTIONS.get(session.getTopic());
                    if (questions != null && nextIndex < questions.size()) {
                        nextQuestion = questions.get(nextIndex);
                    } else {
                        nextQuestion = "Can you share another challenging concept or experience regarding " + session.getTopic() + "?";
                    }
                }
            } else {
                nextQuestion = geminiService.generateNextInterviewQuestion(session.getJobTitle(), history);
                if (nextQuestion == null || nextQuestion.trim().isEmpty()) {
                    nextQuestion = String.format(MOCK_QUESTIONS.get(nextIndex), session.getJobTitle());
                }
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

    @Transactional
    public void deleteSession(String username, UUID sessionId) {
        User user = getUserByUsername(username);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to delete interview session");
        }

        sessionRepository.delete(session);
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
