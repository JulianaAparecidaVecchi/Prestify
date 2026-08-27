package br.com.prestify.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/protected")
public class ProtectedController {

    @GetMapping
    public Map<String, Object> protectedRoute(
            @AuthenticationPrincipal Jwt jwt
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put(
            "message",
            "Você acessou uma rota autenticada."
        );

        response.put("email", jwt.getSubject());
        response.put("userId", jwt.getClaim("userId"));
        response.put("role", jwt.getClaim("role"));
        response.put(
            "organizationId",
            jwt.getClaim("organizationId")
        );

        return response;
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public Map<String, String> ownerOnly() {

        return Map.of(
            "message",
            "Acesso OWNER autorizado."
        );
    }

    @GetMapping("/management")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public Map<String, String> management() {

        return Map.of(
            "message",
            "Acesso de gestão autorizado."
        );
    }
}