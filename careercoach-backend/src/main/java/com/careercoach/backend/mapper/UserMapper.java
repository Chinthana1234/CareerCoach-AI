package com.careercoach.backend.mapper;

import com.careercoach.backend.entity.User;
import com.careercoach.backend.dto.AuthResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthResponse toAuthResponse(User user, String token) {
        if (user == null) {
            return null;
        }
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
