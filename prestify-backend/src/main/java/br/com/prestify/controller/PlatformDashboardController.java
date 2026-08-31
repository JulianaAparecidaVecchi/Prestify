package br.com.prestify.controller;

import br.com.prestify.dto.platform.PlatformDashboardResponse;

import br.com.prestify.service.PlatformDashboardService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    "/api/platform/dashboard"
)
@PreAuthorize(
    "hasRole('SUPER_ADMIN')"
)
public class PlatformDashboardController {

    private final PlatformDashboardService
        platformDashboardService;

    public PlatformDashboardController(
            PlatformDashboardService platformDashboardService
    ) {

        this.platformDashboardService =
            platformDashboardService;
    }

    @GetMapping
    public ResponseEntity<
        PlatformDashboardResponse
    > getDashboard() {

        return ResponseEntity.ok(
            platformDashboardService
                .getDashboard()
        );
    }
}