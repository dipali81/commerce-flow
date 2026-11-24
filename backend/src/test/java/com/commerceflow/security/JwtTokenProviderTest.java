package com.commerceflow.security;

import com.commerceflow.domain.user.Role;
import com.commerceflow.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "jwt-test-secret-key-that-is-definitely-long-enough-for-hs256-algorithm";

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(SECRET, 3_600_000L);
    }

    @Test
    void generatedTokenContainsIdentityAndIsValid() {
        User user = User.builder()
                .id(42L)
                .fullName("Test User")
                .email("test@example.com")
                .passwordHash("hash")
                .role(Role.ROLE_USER)
                .build();

        String token = tokenProvider.generateToken(user);

        assertThat(tokenProvider.isValid(token)).isTrue();
        assertThat(tokenProvider.extractEmail(token)).isEqualTo("test@example.com");
        assertThat(tokenProvider.extractUserId(token)).isEqualTo(42L);
    }

    @Test
    void malformedTokenIsRejected() {
        assertThat(tokenProvider.isValid("not-a-jwt")).isFalse();
    }
}
