package com.careercoach.backend.controller;

import com.careercoach.backend.dto.ChatMessageDto;
import com.careercoach.backend.dto.ChatSessionResponse;
import com.careercoach.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionResponse>> getSessions(Principal principal) {
        return ResponseEntity.ok(chatService.getSessions(principal.getName()));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(
            @RequestParam(required = false) String title,
            Principal principal) {
        return ResponseEntity.ok(chatService.createSession(principal.getName(), title));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable UUID sessionId,
            Principal principal) {
        chatService.deleteSession(principal.getName(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @PathVariable UUID sessionId,
            Principal principal) {
        return ResponseEntity.ok(chatService.getMessages(principal.getName(), sessionId));
    }
}
