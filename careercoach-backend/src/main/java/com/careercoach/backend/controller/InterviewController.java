package com.careercoach.backend.controller;

import com.careercoach.backend.dto.AnswerSubmitDto;
import com.careercoach.backend.dto.InterviewMessageDto;
import com.careercoach.backend.dto.InterviewSessionDto;
import com.careercoach.backend.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionDto> startInterview(
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String interviewType,
            @RequestParam(required = false) String topic,
            Principal principal) {
        return ResponseEntity.ok(interviewService.createSession(principal.getName(), jobTitle, interviewType, topic));
    }

    @PostMapping("/sessions/{sessionId}/answer")
    public ResponseEntity<InterviewSessionDto> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody AnswerSubmitDto answerDto,
            Principal principal) {
        return ResponseEntity.ok(interviewService.submitAnswer(principal.getName(), sessionId, answerDto.getAnswer()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSessionDto> getSession(
            @PathVariable UUID sessionId,
            Principal principal) {
        return ResponseEntity.ok(interviewService.getSession(principal.getName(), sessionId));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<InterviewMessageDto>> getMessages(
            @PathVariable UUID sessionId,
            Principal principal) {
        return ResponseEntity.ok(interviewService.getMessages(principal.getName(), sessionId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<InterviewSessionDto>> getHistory(Principal principal) {
        return ResponseEntity.ok(interviewService.getHistory(principal.getName()));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable UUID sessionId, Principal principal) {
        try {
            interviewService.deleteSession(principal.getName(), sessionId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
