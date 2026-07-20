package com.careercoach.backend.controller;

import com.careercoach.backend.dto.UserDto;
import com.careercoach.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @org.springframework.web.bind.annotation.PathVariable Long userId,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        String newRole = body.get("role");
        return ResponseEntity.ok(adminService.updateUserRole(userId, newRole));
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/chart-data")
    public ResponseEntity<java.util.Map<String, Object>> getChartData() {
        return ResponseEntity.ok(adminService.getChartData());
    }
}
