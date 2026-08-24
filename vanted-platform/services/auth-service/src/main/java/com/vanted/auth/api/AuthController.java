package com.vanted.auth.api;

import com.vanted.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String REFRESH_COOKIE = "vanted_refresh";
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return sessionResponse(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return sessionResponse(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String raw = cookie(request);
        if (raw == null) return ResponseEntity.status(401).build();
        return sessionResponse(authService.refresh(raw));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String raw = cookie(request);
        if (raw != null) authService.revoke(raw);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expiredCookie()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new AuthResponse.UserResponse(
            java.util.UUID.fromString(jwt.getSubject()),
            jwt.getClaimAsString("email"),
            jwt.getClaimAsString("firstName"),
            jwt.getClaimAsString("lastName"),
            jwt.getClaimAsString("role")));
    }

    private ResponseEntity<AuthResponse> sessionResponse(AuthService.AuthResult result) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, result.refreshToken())
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .path("/api/auth")
            .maxAge(Duration.ofDays(30))
            .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(new AuthResponse(result.accessToken(), result.expiresInSeconds(), result.user()));
    }

    private String cookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (var c : request.getCookies()) {
            if (REFRESH_COOKIE.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private String expiredCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
            .httpOnly(true).secure(false).sameSite("Lax").path("/api/auth").maxAge(Duration.ZERO).build().toString();
    }
}
