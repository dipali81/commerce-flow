package com.commerceflow.service;

import com.commerceflow.dto.auth.AuthResponse;
import com.commerceflow.dto.auth.LoginRequest;
import com.commerceflow.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
