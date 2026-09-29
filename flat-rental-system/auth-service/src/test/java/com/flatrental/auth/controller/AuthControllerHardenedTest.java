package com.flatrental.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flatrental.auth.dto.LoginRequest;
import com.flatrental.auth.dto.RegisterRequest;
import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.exception.GlobalExceptionHandler;
import com.flatrental.auth.repository.UserRepository;
import com.flatrental.auth.security.JwtUtil;
import com.flatrental.auth.security.LoginRateLimiter;
import com.flatrental.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerHardenedTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        JwtUtil jwtUtil = new JwtUtil();
        rateLimiter = new LoginRateLimiter();
        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtUtil, rateLimiter);
        AuthController authController = new AuthController(authService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Should return available=true when username is free and valid")
    void testCheckUsername_Available() throws Exception {
        when(userRepository.existsByUsername("unique_user_99")).thenReturn(false);

        mockMvc.perform(get("/api/auth/check-username")
                        .param("username", "unique_user_99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.message").value("Username is available"));
    }

    @Test
    @DisplayName("Should return available=false when username is already taken")
    void testCheckUsername_Taken() throws Exception {
        when(userRepository.existsByUsername("existing_user")).thenReturn(true);

        mockMvc.perform(get("/api/auth/check-username")
                        .param("username", "existing_user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.message").value("Username is already taken"));
    }

    @Test
    @DisplayName("Should return available=false with validation message when username format is invalid")
    void testCheckUsername_InvalidFormat() throws Exception {
        mockMvc.perform(get("/api/auth/check-username")
                        .param("username", "ab")) // too short
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.message").value("Username must be between 3 and 30 characters"));
    }

    @Test
    @DisplayName("Should reject ADMIN role injection during public registration with 400 Bad Request")
    void testRegister_AdminRoleInjection_Rejected() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("hacker_admin");
        request.setEmail("hacker@example.com");
        request.setPassword("password123");
        request.setFullName("Hacker User");
        request.setPhoneNumber("9876543210");
        request.setRole("ADMIN"); // Attempting privilege escalation

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return 429 Too Many Requests when login attempts exceed rate limit")
    void testLogin_RateLimiting_Exceeded() throws Exception {
        LoginRequest request = new LoginRequest("victim_user", "wrongpassword");

        User existingUser = User.builder()
                .id(1L)
                .username("victim_user")
                .password("realhashedpassword")
                .role(Role.ROLE_TENANT)
                .build();

        when(userRepository.findByUsername("victim_user")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongpassword", "realhashedpassword")).thenReturn(false);

        // Fail 5 times
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt should be blocked with 429
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Too many failed login attempts")));
    }
}
