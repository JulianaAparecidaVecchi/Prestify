package br.com.prestify.controller;

import br.com.prestify.dto.platform.settings.PlatformSettingsRequest;
import br.com.prestify.dto.platform.settings.PlatformSettingsResponse;

import br.com.prestify.service.PlatformSettingsService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    "/api/platform/settings"
)
@PreAuthorize(
    "hasRole('SUPER_ADMIN')"
)
public class PlatformSettingsController {

    private final
        PlatformSettingsService
            platformSettingsService;

    public PlatformSettingsController(
            PlatformSettingsService platformSettingsService
    ) {

        this.platformSettingsService =
            platformSettingsService;
    }

    @GetMapping
    public ResponseEntity<
        PlatformSettingsResponse
    > getSettings() {

        return ResponseEntity.ok(
            platformSettingsService
                .getSettings()
        );
    }

    @PutMapping
    public ResponseEntity<
        PlatformSettingsResponse
    > updateSettings(
            @Valid
            @RequestBody
            PlatformSettingsRequest request
    ) {

        return ResponseEntity.ok(
            platformSettingsService
                .updateSettings(
                    request
                )
        );
    }
}