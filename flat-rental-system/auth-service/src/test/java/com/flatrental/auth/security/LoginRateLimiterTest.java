package com.flatrental.auth.security;

import com.flatrental.auth.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
    }

    @Test
    @DisplayName("Should allow login attempts when below maximum limit")
    void testCheckAllowed_BelowLimit_Success() {
        String username = "testuser";
        assertDoesNotThrow(() -> rateLimiter.checkAllowed(username));

        rateLimiter.recordFailedAttempt(username);
        rateLimiter.recordFailedAttempt(username);
        rateLimiter.recordFailedAttempt(username);
        rateLimiter.recordFailedAttempt(username);

        // 4 attempts is below 5
        assertDoesNotThrow(() -> rateLimiter.checkAllowed(username));
    }

    @Test
    @DisplayName("Should throw TooManyRequestsException after 5 failed login attempts")
    void testCheckAllowed_ExceedsLimit_Throws429() {
        String username = "victim_user";

        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailedAttempt(username);
        }

        TooManyRequestsException ex = assertThrows(
                TooManyRequestsException.class,
                () -> rateLimiter.checkAllowed(username)
        );

        assertTrue(ex.getMessage().contains("Too many failed login attempts"));
    }

    @Test
    @DisplayName("Should reset failed attempts upon successful login")
    void testReset_ClearsCounter() {
        String username = "reset_user";

        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailedAttempt(username);
        }

        assertThrows(TooManyRequestsException.class, () -> rateLimiter.checkAllowed(username));

        // Reset called on successful login
        rateLimiter.reset(username);

        assertDoesNotThrow(() -> rateLimiter.checkAllowed(username));
    }

    @Test
    @DisplayName("Should handle case-insensitive and trimmed usernames for rate limiting")
    void testCaseInsensitiveKey() {
        String username = "BruteForcer";

        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailedAttempt("   " + username + "  ");
        }

        assertThrows(TooManyRequestsException.class, () -> rateLimiter.checkAllowed("bruteforcer"));
    }
}
