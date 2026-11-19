package com.ecommerce.controller.admin;

import com.ecommerce.common.ApiResponse;
import com.ecommerce.dto.request.AdminUserCreateRequest;
import com.ecommerce.dto.request.AdminUserUpdateRequest;
import com.ecommerce.dto.request.UpdateUserStatusRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Users fetched",
                adminUserService.listUsers(),
                request.getRequestURI()
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody AdminUserCreateRequest createRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "User created",
                adminUserService.createUser(createRequest),
                request.getRequestURI()
        ));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminUserUpdateRequest updateRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "User updated",
                adminUserService.updateUser(userId, updateRequest),
                request.getRequestURI()
        ));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest updateUserStatusRequest,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "User status updated",
                adminUserService.updateUserStatus(userId, updateUserStatusRequest.active()),
                request.getRequestURI()
        ));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID userId,
            HttpServletRequest request
    ) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted", request.getRequestURI()));
    }
}
