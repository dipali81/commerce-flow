package com.commerceflow.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        Long userId,
        String fullName,
        String email,
        String role
) {
}
