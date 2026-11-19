package com.ecommerce.service;

import com.ecommerce.dto.request.AdminUserCreateRequest;
import com.ecommerce.dto.request.AdminUserUpdateRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.mapper.UserMapper;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test
    void createUserNormalizesEmailHashesPasswordAndInitializesShoppingData() {
        UUID userId = UUID.randomUUID();
        UserResponse response = response(userId, "New Customer", "new@commerce.local");
        when(userRepository.existsByEmailIgnoreCase("new@commerce.local")).thenReturn(false);
        when(passwordEncoder.encode("CommerceDemo2026!")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(userId);
            return user;
        });
        when(userMapper.toResponse(any(User.class))).thenReturn(response);

        UserResponse result = adminUserService.createUser(new AdminUserCreateRequest(
                " New Customer ",
                " New@Commerce.Local ",
                "CommerceDemo2026!",
                Role.USER,
                true,
                false,
                null,
                null
        ));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getFullName()).isEqualTo("New Customer");
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("new@commerce.local");
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("hashed-password");
        verify(cartRepository).save(any(Cart.class));
        verify(wishlistRepository).save(any(Wishlist.class));
        assertThat(result).isSameAs(response);
    }

    @Test
    void createUserRejectsDuplicateEmailWithoutSaving() {
        when(userRepository.existsByEmailIgnoreCase("existing@commerce.local")).thenReturn(true);

        assertThatThrownBy(() -> adminUserService.createUser(new AdminUserCreateRequest(
                "Existing User",
                "existing@commerce.local",
                "CommerceDemo2026!",
                Role.USER,
                true,
                false,
                null,
                null
        ))).isInstanceOf(ConflictException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserDoesNotRehashPasswordWhenNoNewPasswordIsProvided() {
        UUID userId = UUID.randomUUID();
        User existing = User.builder()
                .fullName("Before")
                .email("before@commerce.local")
                .password("existing-hash")
                .role(Role.USER)
                .isActive(true)
                .isEmailVerified(false)
                .build();
        UserResponse response = response(userId, "After", "after@commerce.local");
        existing.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmailIgnoreCase("after@commerce.local")).thenReturn(false);
        when(userRepository.save(existing)).thenReturn(existing);
        when(userMapper.toResponse(existing)).thenReturn(response);

        UserResponse result = adminUserService.updateUser(userId, new AdminUserUpdateRequest(
                "After",
                "after@commerce.local",
                null,
                Role.ADMIN,
                false,
                true,
                null,
                null
        ));

        assertThat(existing.getFullName()).isEqualTo("After");
        assertThat(existing.getEmail()).isEqualTo("after@commerce.local");
        assertThat(existing.getPassword()).isEqualTo("existing-hash");
        assertThat(existing.getRole()).isEqualTo(Role.ADMIN);
        assertThat(existing.getIsActive()).isFalse();
        assertThat(existing.getIsEmailVerified()).isTrue();
        verify(passwordEncoder, never()).encode(any());
        assertThat(result).isSameAs(response);
    }

    private UserResponse response(UUID id, String fullName, String email) {
        LocalDateTime now = LocalDateTime.now();
        return new UserResponse(id, fullName, email, Role.USER, true, false, null, null, now, now, null);
    }
}
