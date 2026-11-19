package com.ecommerce.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RegisterRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void allowsRegistrationWithoutAnOptionalPhoneNumber() {
        RegisterRequest request = new RegisterRequest(
                "Test User",
                "test@example.com",
                "password123",
                ""
        );

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsMalformedPhoneNumbersWhenProvided() {
        RegisterRequest request = new RegisterRequest(
                "Test User",
                "test@example.com",
                "password123",
                "123"
        );

        assertThat(validator.validate(request))
                .anySatisfy(violation -> assertThat(violation.getPropertyPath().toString()).isEqualTo("phone"));
    }
}
