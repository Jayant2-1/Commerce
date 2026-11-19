package com.ecommerce.dto.request;

import com.ecommerce.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(
        @Size(max = 100) String fullName,
        @Email @Size(max = 255) String email,
        @Size(min = 8, max = 72) String password,
        Role role,
        Boolean isActive,
        Boolean isEmailVerified,
        @Pattern(regexp = "^[0-9]{10,15}$", message = "phone must contain 10 to 15 digits")
        String phone,
        @Size(max = 500) String profileImageUrl
) {
}
