package com.vanted.auth.service;

import com.vanted.auth.api.AuthResponse;
import com.vanted.auth.api.LoginRequest;
import com.vanted.auth.api.RegisterRequest;
import com.vanted.auth.domain.RefreshToken;
import com.vanted.auth.domain.Role;
import com.vanted.auth.domain.User;
import com.vanted.auth.repository.RefreshTokenRepository;
import com.vanted.auth.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(UserRepository users, RefreshTokenRepository refreshTokens,
                       PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
                       @Value("${vanted.auth.access-token-ttl-seconds:900}") long accessTokenTtlSeconds,
                       @Value("${vanted.auth.refresh-token-ttl-days:30}") long refreshTokenTtlDays) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.accessTokenTtl = Duration.ofSeconds(accessTokenTtlSeconds);
        this.refreshTokenTtl = Duration.ofDays(refreshTokenTtlDays);
    }

    @Transactional
    public AuthResult register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account already exists for this email");
        }
        User user = users.save(new User(email, passwordEncoder.encode(request.password()),
            request.firstName().trim(), request.lastName().trim(), Role.CUSTOMER));
        return createSession(user);
    }

    @Transactional
    public AuthResult login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .filter(User::isEnabled)
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return createSession(user);
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        RefreshToken token = refreshTokens.findByTokenHash(hash(rawRefreshToken))
            .filter(RefreshToken::isUsable)
            .orElseThrow(() -> new BadCredentialsException("Refresh token is invalid or expired"));
        User user = users.findById(token.getUserId()).filter(User::isEnabled)
            .orElseThrow(() -> new BadCredentialsException("User account is unavailable"));
        token.revoke();
        refreshTokens.save(token);
        return createSession(user);
    }

    @Transactional
    public void revoke(String rawRefreshToken) {
        refreshTokens.findByTokenHash(hash(rawRefreshToken)).ifPresent(token -> {
            token.revoke();
            refreshTokens.save(token);
        });
    }

    private AuthResult createSession(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("vanted-auth")
            .subject(user.getId().toString())
            .issuedAt(now)
            .expiresAt(now.plus(accessTokenTtl))
            .claim("email", user.getEmail())
            .claim("firstName", user.getFirstName())
            .claim("lastName", user.getLastName())
            .claim("role", user.getRole().name())
            .build();
        String accessToken = jwtEncoder.encode(
            JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        String rawRefreshToken = UUID.randomUUID() + "." + UUID.randomUUID();
        refreshTokens.save(new RefreshToken(user.getId(), hash(rawRefreshToken), now.plus(refreshTokenTtl)));
        return new AuthResult(accessToken, rawRefreshToken, accessTokenTtl.toSeconds(),
            new AuthResponse.UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name()));
    }

    private static String normalizeEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    public record AuthResult(String accessToken, String refreshToken, long expiresInSeconds, AuthResponse.UserResponse user) {}
}
