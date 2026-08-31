package br.com.prestify.controller;

import br.com.prestify.dto.auth.AuthMessageResponse;
import br.com.prestify.dto.auth.AuthSessionResponse;
import br.com.prestify.dto.auth.ForgotPasswordRequest;
import br.com.prestify.dto.auth.LoginRequest;
import br.com.prestify.dto.auth.LoginResponse;
import br.com.prestify.dto.auth.ResetPasswordRequest;

import br.com.prestify.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService
        authService;

    public AuthController(
            AuthService authService
    ) {

        this.authService =
            authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse>
        login(
            @Valid
            @RequestBody
            LoginRequest request
        ) {

        return ResponseEntity.ok(
            authService.login(
                request
            )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<AuthSessionResponse>
        getCurrentSession(
            Authentication authentication
        ) {

        return ResponseEntity.ok(
            authService
                .getCurrentSession(
                    authentication
                )
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse>
        forgotPassword(
            @Valid
            @RequestBody
            ForgotPasswordRequest request
        ) {

        return ResponseEntity.ok(
            authService
                .forgotPassword(
                    request
                )
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse>
        resetPassword(
            @Valid
            @RequestBody
            ResetPasswordRequest request
        ) {

        return ResponseEntity.ok(
            authService
                .resetPassword(
                    request
                )
        );
    }
}