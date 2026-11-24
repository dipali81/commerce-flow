package com.commerceflow.controller;

import com.commerceflow.common.ApiResponse;
import com.commerceflow.dto.auth.AuthResponse;
import com.commerceflow.dto.auth.LoginRequest;
import com.commerceflow.dto.auth.RegisterRequest;
import com.commerceflow.security.UserPrincipal;
import com.commerceflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Account created successfully"));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request), "Signed in successfully");
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("userId", principal.getId());
        profile.put("fullName", principal.getFullName());
        profile.put("email", principal.getUsername());
        profile.put("role", principal.getRole().name());
        return ApiResponse.ok(profile);
    }
}
