package br.com.prestify.service;

import br.com.prestify.dto.platform.settings.PlatformSettingsRequest;
import br.com.prestify.dto.platform.settings.PlatformSettingsResponse;

import br.com.prestify.entity.PlatformSettings;
import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;

import br.com.prestify.exception.BusinessException;

import br.com.prestify.repository.PlatformSettingsRepository;

import br.com.prestify.security.CurrentUserService;

import java.net.URI;
import java.net.URISyntaxException;

import java.time.DateTimeException;
import java.time.ZoneId;

import java.util.Currency;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformSettingsService {

    private static final Long
        SETTINGS_ID = 1L;

    private final
        PlatformSettingsRepository
            platformSettingsRepository;

    private final CurrentUserService
        currentUserService;

    public PlatformSettingsService(
            PlatformSettingsRepository platformSettingsRepository,
            CurrentUserService currentUserService
    ) {

        this.platformSettingsRepository =
            platformSettingsRepository;

        this.currentUserService =
            currentUserService;
    }

    @Transactional
    public PlatformSettingsResponse
        getSettings() {

        validateCurrentUser();

        PlatformSettings settings =
            getOrCreateSettings();

        return toResponse(
            settings
        );
    }

    @Transactional
    public PlatformSettingsResponse
        updateSettings(
            PlatformSettingsRequest request
        ) {

        validateCurrentUser();

        validateTimezone(
            request
                .getDefaultTimezone()
        );

        String currency =
            validateCurrency(
                request
                    .getDefaultCurrency()
            );

        String websiteUrl =
            normalize(
                request
                    .getWebsiteUrl()
            );

        validateWebsiteUrl(
            websiteUrl
        );

        PlatformSettings settings =
            getOrCreateSettings();

        settings.setPlatformName(
            request
                .getPlatformName()
                .trim()
        );

        settings.setSupportEmail(
            normalizeLowerCase(
                request
                    .getSupportEmail()
            )
        );

        settings.setSupportPhone(
            normalize(
                request
                    .getSupportPhone()
            )
        );

        settings.setWebsiteUrl(
            websiteUrl
        );

        settings.setDefaultTimezone(
            request
                .getDefaultTimezone()
                .trim()
        );

        settings.setDefaultCurrency(
            currency
        );

        settings
            .setAllowOrganizationRegistration(
                request
                    .getAllowOrganizationRegistration()
            );

        settings.setMaintenanceMode(
            request
                .getMaintenanceMode()
        );

        settings =
            platformSettingsRepository
                .save(settings);

        return toResponse(
            settings
        );
    }

    private PlatformSettings
        getOrCreateSettings() {

        return platformSettingsRepository
            .findById(
                SETTINGS_ID
            )
            .orElseGet(
                () -> {

                    PlatformSettings
                        settings =
                            new PlatformSettings();

                    settings.setId(
                        SETTINGS_ID
                    );

                    return platformSettingsRepository
                        .save(
                            settings
                        );
                }
            );
    }

    private void validateCurrentUser() {

        User user =
            currentUserService
                .getCurrentUser();

        if (
            user == null
            || user.getRole()
                != Role.SUPER_ADMIN
        ) {

            throw new BusinessException(
                "Apenas um SUPER_ADMIN pode acessar as configurações da plataforma."
            );
        }

        if (
            user.getOrganization()
                != null
        ) {

            throw new BusinessException(
                "O SUPER_ADMIN da plataforma não pode estar vinculado a uma organização."
            );
        }

        if (
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            throw new BusinessException(
                "Usuário da plataforma inativo."
            );
        }
    }

    private void validateTimezone(
            String timezone
    ) {

        if (
            timezone == null
            || timezone.isBlank()
        ) {

            throw new BusinessException(
                "Informe o fuso horário padrão."
            );
        }

        try {

            ZoneId.of(
                timezone.trim()
            );

        } catch (
            DateTimeException ex
        ) {

            throw new BusinessException(
                "Fuso horário inválido."
            );
        }
    }

    private String validateCurrency(
            String currency
    ) {

        if (
            currency == null
            || currency.isBlank()
        ) {

            throw new BusinessException(
                "Informe a moeda padrão."
            );
        }

        String normalized =
            currency
                .trim()
                .toUpperCase();

        try {

            Currency.getInstance(
                normalized
            );

        } catch (
            IllegalArgumentException ex
        ) {

            throw new BusinessException(
                "Moeda inválida."
            );
        }

        return normalized;
    }

    private void validateWebsiteUrl(
            String websiteUrl
    ) {

        if (websiteUrl == null) {
            return;
        }

        try {

            URI uri =
                new URI(
                    websiteUrl
                );

            String scheme =
                uri.getScheme();

            String host =
                uri.getHost();

            if (
                scheme == null
                || host == null
                || (
                    !scheme.equalsIgnoreCase(
                        "http"
                    )
                    &&
                    !scheme.equalsIgnoreCase(
                        "https"
                    )
                )
            ) {

                throw new BusinessException(
                    "Informe uma URL válida para o site."
                );
            }

        } catch (
            URISyntaxException ex
        ) {

            throw new BusinessException(
                "Informe uma URL válida para o site."
            );
        }
    }

    private PlatformSettingsResponse
        toResponse(
            PlatformSettings settings
        ) {

        return new PlatformSettingsResponse(
            settings.getId(),
            settings.getPlatformName(),
            settings.getSupportEmail(),
            settings.getSupportPhone(),
            settings.getWebsiteUrl(),
            settings.getDefaultTimezone(),
            settings.getDefaultCurrency(),
            settings
                .getAllowOrganizationRegistration(),
            settings
                .getMaintenanceMode(),
            settings.getCreatedAt(),
            settings.getUpdatedAt()
        );
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
            value.trim();

        return normalized.isEmpty()
            ? null
            : normalized;
    }

    private String
        normalizeLowerCase(
            String value
        ) {

        String normalized =
            normalize(value);

        return normalized == null
            ? null
            : normalized
                .toLowerCase();
    }
}