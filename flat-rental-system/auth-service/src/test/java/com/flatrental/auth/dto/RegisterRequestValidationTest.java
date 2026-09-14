package com.flatrental.auth.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
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
    @DisplayName("Should accept valid 10-digit Indian mobile numbers")
    void testValidPhoneNumber_Accepted() {
        String[] validPhones = {"9876543210", "8123456789", "7000000000", "6123456789"};
        for (String phone : validPhones) {
            RegisterRequest request = createValidRequest();
            request.setPhoneNumber(phone);

            Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
            boolean hasPhoneViolation = violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

            assertFalse(hasPhoneViolation, "Valid phone '" + phone + "' should be accepted with 0 violations");
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"abcdefghij", "98765abcde", "phone12345", "98765@4321"})
    @DisplayName("Should reject non-numeric/alphabetic phone numbers")
    void testInvalidPhoneString_Rejected(String invalidPhone) {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber(invalidPhone);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasPhoneViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

        assertTrue(hasPhoneViolation, "Alphabetic phone '" + invalidPhone + "' must be rejected");
    }

    @ParameterizedTest
    @ValueSource(strings = {"987654321", "9", "98765432100", "987654321099"})
    @DisplayName("Should reject phone numbers with wrong length (not exactly 10 digits)")
    void testInvalidPhoneLength_Rejected(String wrongLengthPhone) {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber(wrongLengthPhone);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasPhoneViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

        assertTrue(hasPhoneViolation, "Phone with wrong length '" + wrongLengthPhone + "' must be rejected");
    }

    @ParameterizedTest
    @ValueSource(strings = {"5876543210", "1234567890", "0987654321", "2345678901"})
    @DisplayName("Should reject phone numbers with invalid Indian starting digit (not 6, 7, 8, or 9)")
    void testInvalidPhoneStartingDigit_Rejected(String invalidStartPhone) {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber(invalidStartPhone);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasPhoneViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

        assertTrue(hasPhoneViolation, "Phone starting with invalid digit '" + invalidStartPhone + "' must be rejected");
    }

    @Test
    @DisplayName("Should reject null or blank phone number")
    void testNullOrBlankPhone_Rejected() {
        RegisterRequest request = createValidRequest();
        request.setPhoneNumber(null);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasPhoneViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

        assertTrue(hasPhoneViolation, "Null phone number must be rejected");

        request.setPhoneNumber("   ");
        violations = validator.validate(request);
        hasPhoneViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("phoneNumber"));

        assertTrue(hasPhoneViolation, "Blank phone number must be rejected");
    }

    @ParameterizedTest
    @ValueSource(strings = {"@abc.com", "abc@", "abc", "abc@def"})
    @DisplayName("Should reject invalid email formats")
    void testInvalidEmail_Rejected(String invalidEmail) {
        RegisterRequest request = createValidRequest();
        request.setEmail(invalidEmail);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasEmailViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("email"));

        assertTrue(hasEmailViolation, "Invalid email '" + invalidEmail + "' must be rejected");
    }

    @ParameterizedTest
    @ValueSource(strings = {"user@example.com", "john.doe@domain.co.in", "tenant+test@mail.org", "harsh@gmail.com"})
    @DisplayName("Should accept valid email formats")
    void testValidEmail_Accepted(String validEmail) {
        RegisterRequest request = createValidRequest();
        request.setEmail(validEmail);

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        boolean hasEmailViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("email"));

        assertFalse(hasEmailViolation, "Valid email '" + validEmail + "' must be accepted");
    }

    @Test
    @DisplayName("Should pass validation when all fields are valid")
    void testCompleteValidRequest_NoViolations() {
        RegisterRequest request = createValidRequest();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty(), "Valid request should produce 0 violations");
    }
}
