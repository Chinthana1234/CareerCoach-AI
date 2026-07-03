package com.careercoach.backend.service;

import com.careercoach.backend.dto.AuthResponse;
import com.careercoach.backend.dto.LoginRequest;
import com.careercoach.backend.dto.RegisterRequest;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.mapper.UserMapper;
import com.careercoach.backend.repository.UserRepository;
import com.careercoach.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return userMapper.toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        // Retrieve standard username (needed if they entered email to log in)
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        // Authenticate with AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        String token = jwtUtil.generateToken(user.getUsername());
        return userMapper.toAuthResponse(user, token);
    }
}
