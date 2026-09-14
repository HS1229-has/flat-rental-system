package com.flatrental.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flatrental.auth.dto.RegisterRequest;
import com.flatrental.auth.dto.UserResponse;
import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.exception.GlobalExceptionHandler;
import com.flatrental.auth.repository.UserRepository;
import com.flatrental.auth.security.JwtUtil;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerValidationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        JwtUtil jwtUtil = new JwtUtil();
        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtUtil);
        AuthController authController = new AuthController(authService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private RegisterRequest createValidRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("validuser");
        request.setEmail("user@example.com");
        request.setPassword("password123");
        request.setFullName("Valid User");
        request.setPhoneNumber("9876543210");
        request.setRole("TENANT");
        return request;
    }

    @Test
    @DisplayName("Should return 400 Bad Request when email format is invalid in HTTP request")
    void testRegister_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = createValidRequest();
        request.setEmail("@abc.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("email")));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when phone number length is invalid in HTTP request")
    void testRegister_InvalidPhoneLength_Returns400() throws Exception {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber("987654321"); // 9 digits

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("phoneNumber")));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when phone number contains alphabetic characters")
    void testRegister_AlphabeticPhone_Returns400() throws Exception {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber("98765abcde");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("phoneNumber")));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when phone number has invalid starting digit")
    void testRegister_InvalidStartingDigitPhone_Returns400() throws Exception {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber("5876543210"); // starts with 5

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return 201 Created when email and phone are valid in HTTP request")
    void testRegister_ValidRequest_Returns201() throws Exception {
        RegisterRequest request = createValidRequest();

        when(userRepository.existsByUsername("validuser")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed123");

        User savedUser = User.builder()
                .id(1L)
                .username("validuser")
                .email("user@example.com")
                .password("hashed123")
                .fullName("Valid User")
                .phoneNumber("9876543210")
                .role(Role.ROLE_TENANT)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("validuser"))
                .andExpect(jsonPath("$.role").value("ROLE_TENANT"));

        verify(userRepository, times(1)).save(any(User.class));
    }
}
