package com.flatrental.auth.service;

import com.flatrental.auth.dto.AuthResponse;
import com.flatrental.auth.dto.LoginRequest;
import com.flatrental.auth.dto.RegisterRequest;
import com.flatrental.auth.dto.UserResponse;
import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.exception.DuplicateResourceException;
import com.flatrental.auth.exception.InvalidCredentialsException;
import com.flatrental.auth.repository.UserRepository;
import com.flatrental.auth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Role role = parseRole(request.getRole());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(role)
                .build();

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    private Role parseRole(String rawRole) {
        try {
            String normalized = rawRole.toUpperCase().startsWith("ROLE_") ? rawRole.toUpperCase() : "ROLE_" + rawRole.toUpperCase();
            return Role.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + rawRole + ". Allowed values: TENANT, OWNER, ADMIN");
        }
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .contactPhone(user.getContactPhone())
                .contactEmail(user.getContactEmail())
                .preferredContactMethod(user.getPreferredContactMethod())
                .contactDetailsUpdatedAt(user.getContactDetailsUpdatedAt())
                .build();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.flatrental.auth.exception.ResourceNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserContact(Long id, String contactPhone, String contactEmail, String preferredContactMethod) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.flatrental.auth.exception.ResourceNotFoundException("User not found with id: " + id));
        user.setContactPhone(contactPhone);
        user.setContactEmail(contactEmail);
        user.setPreferredContactMethod(preferredContactMethod);
        user.setContactDetailsUpdatedAt(java.time.LocalDateTime.now());
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }
}
