package com.flatrental.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", expirationMs);
    }

    @Test
    @DisplayName("Should generate token and extract correct username, role, and userId")
    void testGenerateAndExtractClaims() {
        String token = jwtUtil.generateToken("tenant_john", "ROLE_TENANT", 42L);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        assertEquals("tenant_john", jwtUtil.extractUsername(token));
        assertEquals("ROLE_TENANT", jwtUtil.extractRole(token));
        assertEquals(Long.valueOf(42L), jwtUtil.<Long>extractClaim(token, claims -> claims.get("userId", Long.class)));
    }

    @Test
    @DisplayName("Should validate token successfully for matching username")
    void testIsTokenValid_True() {
        String token = jwtUtil.generateToken("owner_alice", "ROLE_OWNER", 101L);

        assertTrue(jwtUtil.isTokenValid(token, "owner_alice"));
    }

    @Test
    @DisplayName("Should reject token when username does not match")
    void testIsTokenValid_False_WrongUsername() {
        String token = jwtUtil.generateToken("owner_alice", "ROLE_OWNER", 101L);

        assertFalse(jwtUtil.isTokenValid(token, "wrong_user"));
    }

    @Test
    @DisplayName("Should reject expired token")
    void testExpiredToken() {
        // Set expiration to negative to simulate expired token
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", -5000L);
        String token = jwtUtil.generateToken("user_expired", "ROLE_TENANT", 5L);

        // Parsing expired token throws ExpiredJwtException
        assertThrows(Exception.class, () -> jwtUtil.extractUsername(token));
    }
}
