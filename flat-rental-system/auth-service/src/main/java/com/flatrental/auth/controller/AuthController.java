package com.flatrental.auth.controller;

import com.flatrental.auth.dto.AuthResponse;
import com.flatrental.auth.dto.LoginRequest;
import com.flatrental.auth.dto.RegisterRequest;
import com.flatrental.auth.dto.UserResponse;
import com.flatrental.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PutMapping("/users/{id}/contact")
    public ResponseEntity<UserResponse> updateUserContact(
            @PathVariable Long id,
            @Valid @RequestBody com.flatrental.auth.dto.ContactUpdateRequest request) {
        return ResponseEntity.ok(authService.updateUserContact(id, request.getContactPhone(), request.getContactEmail(), request.getPreferredContactMethod()));
    }
}
