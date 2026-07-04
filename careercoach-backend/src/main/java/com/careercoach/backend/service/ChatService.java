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

import java.util.List;
import java.util.UUID;
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
}
