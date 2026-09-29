package com.flatrental.auth.security;

import com.flatrental.auth.exception.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding-window rate limiter to protect login endpoints
 * against brute force attacks and credential stuffing.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_WINDOW_SECONDS = 300; // 5 minutes

    private static class AttemptTracker {
        int count;
        Instant firstAttempt;
        Instant lastAttempt;

        AttemptTracker() {
            this.count = 1;
            this.firstAttempt = Instant.now();
            this.lastAttempt = Instant.now();
        }
    }

    private final ConcurrentHashMap<String, AttemptTracker> attempts = new ConcurrentHashMap<>();

    public void checkAllowed(String key) {
        if (key == null || key.isBlank()) return;

        AttemptTracker tracker = attempts.get(key.toLowerCase().trim());
        if (tracker != null) {
            Instant now = Instant.now();
            long elapsed = now.getEpochSecond() - tracker.firstAttempt.getEpochSecond();

            if (elapsed > LOCK_WINDOW_SECONDS) {
                // Window expired, reset tracker
                attempts.remove(key.toLowerCase().trim());
            } else if (tracker.count >= MAX_ATTEMPTS) {
                long remainingSeconds = LOCK_WINDOW_SECONDS - elapsed;
                long minutes = Math.max(1, (remainingSeconds + 59) / 60);
                throw new TooManyRequestsException(
                        "Too many failed login attempts. For security, please wait " + minutes + " minute(s) before trying again."
                );
            }
        }
    }

    public void recordFailedAttempt(String key) {
        if (key == null || key.isBlank()) return;

        String normalizedKey = key.toLowerCase().trim();
        attempts.compute(normalizedKey, (k, tracker) -> {
            Instant now = Instant.now();
            if (tracker == null) {
                return new AttemptTracker();
            }
            long elapsed = now.getEpochSecond() - tracker.firstAttempt.getEpochSecond();
            if (elapsed > LOCK_WINDOW_SECONDS) {
                // Prior window expired, start fresh
                return new AttemptTracker();
            }
            tracker.count++;
            tracker.lastAttempt = now;
            return tracker;
        });
    }

    public void reset(String key) {
        if (key != null && !key.isBlank()) {
            attempts.remove(key.toLowerCase().trim());
        }
    }
}
