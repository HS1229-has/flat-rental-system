package com.flatrental.auth.service;

import com.flatrental.auth.dto.AuthResponse;
import com.flatrental.auth.dto.LoginRequest;
import com.flatrental.auth.dto.RegisterRequest;
import com.flatrental.auth.dto.UserResponse;
import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.exception.DuplicateResourceException;
import com.flatrental.auth.exception.InvalidCredentialsException;
import com.flatrental.auth.exception.ResourceNotFoundException;
import com.flatrental.auth.repository.UserRepository;
import com.flatrental.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtUtil jwtUtil;
    private AuthService authService;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtUtil);

        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_pass")
                .fullName("Test User")
                .phoneNumber("9876543210")
                .role(Role.ROLE_TENANT)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setFullName("New User");
        request.setPhoneNumber("9999999999");
        request.setRole("TENANT");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("newuser", response.getUsername());
        assertEquals("ROLE_TENANT", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException if username already exists")
    void testRegister_DuplicateUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException if email already exists")
    void testRegister_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("uniqueuser");
        request.setEmail("test@example.com");

        when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException if role is invalid")
    void testRegister_InvalidRole() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("gooduser");
        request.setEmail("good@example.com");
        request.setPassword("pass");
        request.setRole("INVALID_ROLE");

        when(userRepository.existsByUsername("gooduser")).thenReturn(false);
        when(userRepository.existsByEmail("good@example.com")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Should successfully authenticate and return JWT token on login")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("rawpassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("rawpassword", sampleUser.getPassword())).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertEquals(1L, response.getUserId());
        assertEquals("testuser", response.getUsername());
        assertEquals("ROLE_TENANT", response.getRole());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when username not found")
    void testLogin_InvalidUsername() {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("pass");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when password does not match")
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", sampleUser.getPassword())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should return user by ID when user exists")
    void testGetUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = authService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user ID not found")
    void testGetUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getUserById(999L));
    }

    @Test
    @DisplayName("Should successfully update user contact info")
    void testUpdateUserContact_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = authService.updateUserContact(1L, "9111111111", "contact@test.com", "PHONE");

        assertNotNull(response);
        assertEquals("9111111111", response.getContactPhone());
        assertEquals("contact@test.com", response.getContactEmail());
        assertEquals("PHONE", response.getPreferredContactMethod());
    }

    @Test
    @DisplayName("Should retrieve all users")
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));

        List<UserResponse> list = authService.getAllUsers();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("testuser", list.get(0).getUsername());
    }
}
