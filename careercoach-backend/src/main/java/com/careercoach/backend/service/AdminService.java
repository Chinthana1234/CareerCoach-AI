package com.careercoach.backend.service;

import com.careercoach.backend.dto.UserDto;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToUserDto).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public UserDto updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(newRole.toUpperCase());
        user = userRepository.save(user);
        return mapToUserDto(user);
    }

    public java.util.Map<String, Object> getDashboardStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", userRepository.count());
        // Since we are mocking other counts for now until we inject all repos:
        stats.put("totalCvReviews", 0); // Placeholder
        stats.put("totalInterviews", 0); // Placeholder
        return stats;
    }

    public java.util.Map<String, Object> getChartData() {
        java.util.Map<String, Object> chartData = new java.util.HashMap<>();
        // Mock data for charts to satisfy frontend initially
        chartData.put("usersGrowth", List.of(
            java.util.Map.of("name", "Jan", "users", 400),
            java.util.Map.of("name", "Feb", "users", 300),
            java.util.Map.of("name", "Mar", "users", 200),
            java.util.Map.of("name", "Apr", "users", 278),
            java.util.Map.of("name", "May", "users", 189)
        ));
        return chartData;
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
