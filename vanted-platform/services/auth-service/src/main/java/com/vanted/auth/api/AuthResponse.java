package com.vanted.auth.api;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    long expiresInSeconds,
    UserResponse user
) {
    public record UserResponse(UUID id, String email, String firstName, String lastName, String role) {}
}
