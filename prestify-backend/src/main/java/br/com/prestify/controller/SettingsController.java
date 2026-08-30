package br.com.prestify.controller;

import br.com.prestify.dto.settings.BillingResponse;
import br.com.prestify.dto.settings.BillingUpdateRequest;
import br.com.prestify.dto.settings.OrganizationModulesRequest;
import br.com.prestify.dto.settings.OrganizationSettingsRequest;
import br.com.prestify.dto.settings.OrganizationSettingsResponse;
import br.com.prestify.dto.settings.SystemSettingsRequest;
import br.com.prestify.dto.settings.SystemSettingsResponse;

import br.com.prestify.service.SettingsService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService
        settingsService;

    public SettingsController(
            SettingsService settingsService
    ) {

        this.settingsService =
            settingsService;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public OrganizationSettingsResponse
        getSettings() {

        return settingsService
            .getSettings();
    }

    @PutMapping("/organization")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public OrganizationSettingsResponse
        updateOrganization(
            @Valid
            @RequestBody
            OrganizationSettingsRequest request
        ) {

        return settingsService
            .updateOrganization(
                request
            );
    }

    @PutMapping("/modules")
    @PreAuthorize(
        "hasRole('OWNER')"
    )
    public OrganizationSettingsResponse
        updateModules(
            @Valid
            @RequestBody
            OrganizationModulesRequest request
        ) {

        return settingsService
            .updateModules(
                request
            );
    }

    @GetMapping("/billing")
    @PreAuthorize(
        "hasRole('OWNER')"
    )
    public BillingResponse
        getBilling() {

        return settingsService
            .getBilling();
    }

    @PutMapping("/billing")
    @PreAuthorize(
        "hasRole('OWNER')"
    )
    public BillingResponse
        updateBilling(
            @Valid
            @RequestBody
            BillingUpdateRequest request
        ) {

        return settingsService
            .updateBilling(
                request
            );
    }

    /*
     * =========================
     * CONFIGURAÇÕES DO SISTEMA
     * =========================
     */

    @GetMapping("/system")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public SystemSettingsResponse
        getSystemSettings() {

        return settingsService
            .getSystemSettings();
    }

    @PutMapping("/system")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public SystemSettingsResponse
        updateSystemSettings(
            @Valid
            @RequestBody
            SystemSettingsRequest request
        ) {

        return settingsService
            .updateSystemSettings(
                request
            );
    }
}