package com.ecommerce.dto.request;

import com.ecommerce.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUserCreateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotNull Role role,
        @NotNull Boolean isActive,
        @NotNull Boolean isEmailVerified,
        @Pattern(regexp = "^[0-9]{10,15}$", message = "phone must contain 10 to 15 digits")
        String phone,
        @Size(max = 500) String profileImageUrl
) {
}
