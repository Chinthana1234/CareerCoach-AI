package com.careercoach.backend.service;

import com.careercoach.backend.dto.ChatMessageDto;
import com.careercoach.backend.dto.ChatSessionResponse;
import com.careercoach.backend.entity.ChatMessage;
import com.careercoach.backend.entity.ChatSession;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.ChatMessageRepository;
import com.careercoach.backend.repository.ChatSessionRepository;
import com.careercoach.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private ChatSession getSessionValidated(UUID sessionId, User user) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to chat session");
        }
        return session;
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions(String username) {
        User user = getUserByUsername(username);
        return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(session -> ChatSessionResponse.builder()
                        .id(session.getId())
                        .title(session.getTitle())
                        .createdAt(session.getCreatedAt())
                        .updatedAt(session.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatSessionResponse createSession(String username, String title) {
        User user = getUserByUsername(username);
        String sessionTitle = (title == null || title.trim().isEmpty()) ? "New Career Consultation" : title.trim();
        
        ChatSession session = ChatSession.builder()
                .title(sessionTitle)
                .user(user)
                .build();
        
        session = chatSessionRepository.save(session);
        
        return ChatSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    @Transactional
    public void deleteSession(String username, UUID sessionId) {
        User user = getUserByUsername(username);
        ChatSession session = getSessionValidated(sessionId, user);
        chatSessionRepository.delete(session);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessages(String username, UUID sessionId) {
        User user = getUserByUsername(username);
        // Validates that session exists and belongs to the user
        getSessionValidated(sessionId, user);
        
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(message -> ChatMessageDto.builder()
                        .id(message.getId())
                        .sender(message.getSender())
                        .content(message.getContent())
                        .createdAt(message.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String generateSimulatedResponse(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("resume") || lower.contains("cv")) {
            return "### Resume & CV Optimization Guide\n\n" +
                    "To stand out to recruiters and pass applicant tracking systems (ATS), structure your CV carefully:\n\n" +
                    "1. **Use the STAR Method**: For each bullet point in your experience, describe the **S**ituation, **T**ask, **A**ction, and **R**esult. Quantify your achievements (e.g., *'Improved page load speed by 40% using React code-splitting'*).\n" +
                    "2. **Keyword Optimization**: Scan the job description and naturalize key skills (e.g., *Java, Spring Boot, CI/CD*) into your resume.\n" +
                    "3. **Clean Layout**: Use a single-column, standard font layout. Avoid graphics, progress bars, or complex tables that break ATS parsers.\n\n" +
                    "Would you like me to review a specific section of your resume? Paste it here!";
        } else if (lower.contains("interview")) {
            return "### Ace Your Next Interview\n\n" +
                    "Preparation is the key to interviewing with confidence:\n\n" +
                    "- **Behavioral Questions**: Structure answers using **STAR** (Situation, Task, Action, Result). Prepare 3-5 core stories demonstrating leadership, conflict resolution, or technical challenge.\n" +
                    "- **Technical Questions**: For coding interviews, explain your thought process out loud before writing any code. Talk about time and space complexities ($O(n)$ or $O(log\\ n)$).\n" +
                    "- **Ask Smart Questions**: At the end, ask the interviewer: *'What does success look like in the first 90 days of this role?'*\n\n" +
                    "What role or company are you interviewing for? I can run a mock simulation with you.";
        } else if (lower.contains("roadmap") || lower.contains("career")) {
            return "### Strategic Career Roadmap\n\n" +
                    "Designing a clear path accelerates your professional development:\n\n" +
                    "1. **Identify Target Role**: Define where you want to be in 2-3 years (e.g., Senior Full Stack Developer, Solutions Architect).\n" +
                    "2. **Skill Gap Analysis**: Compare your current skills against job requirements. Dedicate 3-5 hours a week to learning missing skills.\n" +
                    "3. **Build Public Evidence**: Build side projects, write technical blogs, or contribute to open-source to show your competence.\n" +
                    "What is your current role and your dream target position? Let's map it out step-by-step.";
        } else if (lower.contains("hello") || lower.contains("hi ") || lower.contains("hey")) {
            return "### Welcome to CareerCoach AI!\n\n" +
                    "I am your personal AI Career Assistant. I can help you with:\n\n" +
                    "* **Resume & LinkedIn Optimization**: Making your profile stand out.\n" +
                    "* **Interview Prep**: Simulating mock interviews and detailing answer strategies.\n" +
                    "* **Career Roadmaps**: Planning transitions or promotions.\n\n" +
                    "How can I assist you in your professional journey today?";
        } else {
            return "### Career Coach Insights\n\n" +
                    "Thank you for sharing that! As your career coach, I suggest we break this down:\n\n" +
                    "* **Clarify Goals**: Make sure your target matches your strengths.\n" +
                    "* **Actionable Steps**: Set 1-2 immediate tasks rather than trying to do everything at once.\n" +
                    "* **Feedback Loop**: Continuously evaluate your progress.\n\n" +
                    "Could you tell me a bit more about your background or the specific challenge you are facing? I am here to help!";
        }
    }

    @Transactional
    public SseEmitter streamChat(String username, UUID sessionId, String prompt) {
        User user = getUserByUsername(username);
        ChatSession session = getSessionValidated(sessionId, user);

        // 1. Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender("USER")
                .content(prompt)
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Auto-update session title if it's the first message
        List<ChatMessage> existingMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        if (existingMessages.size() <= 1) { // includes the user message we just added
            String cleanPrompt = prompt.trim();
            String newTitle = cleanPrompt.length() > 30 ? cleanPrompt.substring(0, 27) + "..." : cleanPrompt;
            session.setTitle(newTitle);
            chatSessionRepository.save(session);
        }

        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout
        String fullResponse = generateSimulatedResponse(prompt);

        CompletableFuture.runAsync(() -> {
            try {
                // Split response into chunks of words/characters to simulate streaming
                int chunkSize = 6;
                for (int i = 0; i < fullResponse.length(); i += chunkSize) {
                    int end = Math.min(i + chunkSize, fullResponse.length());
                    String chunk = fullResponse.substring(i, end);
                    emitter.send(SseEmitter.event().data(chunk));
                    Thread.sleep(40); // 40ms delay to make streaming visible
                }

                // Save assistant message to database by constructing a stub ChatSession
                ChatMessage aiMessage = ChatMessage.builder()
                        .session(ChatSession.builder().id(sessionId).build())
                        .sender("AI")
                        .content(fullResponse)
                        .build();
                chatMessageRepository.save(aiMessage);

                // Update session's updatedAt timestamp
                chatSessionRepository.updateSessionTimestamp(sessionId);

                emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
