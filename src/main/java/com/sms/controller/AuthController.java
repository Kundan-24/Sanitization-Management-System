package com.sms.controller;

import com.sms.dto.AdminLoginDto;
import com.sms.dto.AdminLoginResponse;
import com.sms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginDto request) {
        String token = authService.loginAndGetToken(request.getUsername(), request.getPassword());
        var admin = authService.getAdmin(request.getUsername());

        ResponseCookie cookie = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(false) // localhost development
                .path("/")
                .maxAge(jwtExpiration / 1000)
                .sameSite("Lax")
                .build();

        AdminLoginResponse response = new AdminLoginResponse("Login successful", admin.getUsername(), admin.getName(), admin.getRole());
        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            authService.logout(authentication.getName());
        }

        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body("Logged out successfully");
    }
}