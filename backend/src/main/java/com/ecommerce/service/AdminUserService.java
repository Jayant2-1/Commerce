package com.ecommerce.service;

import com.ecommerce.dto.request.AdminUserCreateRequest;
import com.ecommerce.dto.request.AdminUserUpdateRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.UserMapper;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(AdminUserCreateRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .isActive(request.isActive())
                .isEmailVerified(request.isEmailVerified())
                .phone(normalizeOptionalValue(request.phone()))
                .profileImageUrl(normalizeOptionalValue(request.profileImageUrl()))
                .build();

        User savedUser = userRepository.save(user);
        cartRepository.save(Cart.builder().user(savedUser).build());
        wishlistRepository.save(Wishlist.builder().user(savedUser).name("My Wishlist").build());
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(UUID userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.fullName() != null) {
            if (request.fullName().isBlank()) {
                throw new BadRequestException("Full name cannot be blank");
            }
            user.setFullName(request.fullName().trim());
        }
        if (request.email() != null) {
            String email = normalizeEmail(request.email());
            if (email.isBlank()) {
                throw new BadRequestException("Email cannot be blank");
            }
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new ConflictException("Email is already registered");
            }
            user.setEmail(email);
        }
        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }
        if (request.isEmailVerified() != null) {
            user.setIsEmailVerified(request.isEmailVerified());
        }
        if (request.phone() != null) {
            user.setPhone(normalizeOptionalValue(request.phone()));
        }
        if (request.profileImageUrl() != null) {
            user.setProfileImageUrl(normalizeOptionalValue(request.profileImageUrl()));
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserStatus(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(active);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalValue(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
