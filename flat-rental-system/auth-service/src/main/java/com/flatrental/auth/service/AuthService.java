package com.flatrental.auth.service;

import com.flatrental.auth.dto.*;
import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.exception.DuplicateResourceException;
import com.flatrental.auth.exception.InvalidCredentialsException;
import com.flatrental.auth.repository.UserRepository;
import com.flatrental.auth.security.JwtUtil;
import com.flatrental.auth.security.LoginRateLimiter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter loginRateLimiter;

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, LoginRateLimiter loginRateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginRateLimiter = loginRateLimiter != null ? loginRateLimiter : new LoginRateLimiter();
    }

    // Overloaded constructor for backwards compatibility with test suites
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this(userRepository, passwordEncoder, jwtUtil, new LoginRateLimiter());
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

        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String fullName = request.getFullName() != null ? request.getFullName().trim().replaceAll("\\s+", " ") : "";
        String phone = normalizePhone(request.getPhoneNumber());

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(fullName)
                .phoneNumber(phone)
                .role(role)
                .build();

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();
        if (username != null) {
            loginRateLimiter.checkAllowed(username);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    if (username != null) loginRateLimiter.recordFailedAttempt(username);
                    return new InvalidCredentialsException("Invalid username or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            if (username != null) loginRateLimiter.recordFailedAttempt(username);
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if (username != null) loginRateLimiter.reset(username);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public UsernameAvailabilityResponse checkUsernameAvailability(String rawUsername) {
        if (rawUsername == null || rawUsername.isBlank()) {
            return new UsernameAvailabilityResponse(false, "Username is required");
        }
        String username = rawUsername.trim();
        if (username.length() < 3 || username.length() > 30) {
            return new UsernameAvailabilityResponse(false, "Username must be between 3 and 30 characters");
        }
        if (!username.matches("^[a-zA-Z0-9_.]+$")) {
            return new UsernameAvailabilityResponse(false, "Username can only contain letters, numbers, underscores, and periods");
        }
        boolean exists = userRepository.existsByUsername(username) || userRepository.existsByUsernameIgnoreCase(username);
        if (exists) {
            return new UsernameAvailabilityResponse(false, "Username is already taken");
        }
        return new UsernameAvailabilityResponse(true, "Username is available");
    }

    private Role parseRole(String rawRole) {
        String normalized = rawRole.toUpperCase().startsWith("ROLE_") ? rawRole.toUpperCase() : "ROLE_" + rawRole.toUpperCase();
        try {
            Role role = Role.valueOf(normalized);
            if (role == Role.ROLE_ADMIN) {
                throw new IllegalArgumentException("Invalid role: ADMIN. Public registration only allows: TENANT, OWNER");
            }
            return role;
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + rawRole + ". Allowed values: TENANT, OWNER");
        }
    }

    private String normalizePhone(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.startsWith("91") && digits.length() == 12) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 11) {
            digits = digits.substring(1);
        }
        return digits;
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
