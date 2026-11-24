package com.commerceflow.service;

import com.commerceflow.domain.user.Role;
import com.commerceflow.domain.user.User;
import com.commerceflow.dto.auth.AuthResponse;
import com.commerceflow.dto.auth.LoginRequest;
import com.commerceflow.dto.auth.RegisterRequest;
import com.commerceflow.exception.DuplicateResourceException;
import com.commerceflow.exception.UnauthorizedException;
import com.commerceflow.repository.UserRepository;
import com.commerceflow.security.JwtTokenProvider;
import com.commerceflow.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerNormalizesEmailHashesPasswordAndIssuesToken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn("encoded-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(tokenProvider.generateToken(any(User.class))).thenReturn("jwt-token");
        when(tokenProvider.getExpirationMs()).thenReturn(86_400_000L);

        AuthResponse response = authService.register(
                new RegisterRequest("Test User", "  TEST@Example.COM  ", "Password1"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("test@example.com");
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("encoded-hash");
        assertThat(captor.getValue().getRole()).isEqualTo(Role.ROLE_USER);
        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.expiresInSeconds()).isEqualTo(86_400L);
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Test User", "test@example.com", "Password1")))
                .isInstanceOf(DuplicateResourceException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginRejectsWrongPassword() {
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("encoded-hash")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("test@example.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
