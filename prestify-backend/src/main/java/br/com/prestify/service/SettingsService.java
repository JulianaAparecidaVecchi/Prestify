package br.com.prestify.service;

import br.com.prestify.dto.settings.BillingResponse;
import br.com.prestify.dto.settings.BillingUpdateRequest;
import br.com.prestify.dto.settings.OrganizationModulesRequest;
import br.com.prestify.dto.settings.OrganizationSettingsRequest;
import br.com.prestify.dto.settings.OrganizationSettingsResponse;
import br.com.prestify.dto.settings.SystemSettingsRequest;
import br.com.prestify.dto.settings.SystemSettingsResponse;

import br.com.prestify.entity.Organization;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;
import br.com.prestify.enums.SystemModule;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.OrganizationRepository;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final OrganizationRepository
        organizationRepository;

    private final CurrentUserService
        currentUserService;

    public SettingsService(
            OrganizationRepository organizationRepository,
            CurrentUserService currentUserService
    ) {

        this.organizationRepository =
            organizationRepository;

        this.currentUserService =
            currentUserService;
    }

    @Transactional(readOnly = true)
    public OrganizationSettingsResponse
        getSettings() {

        return toResponse(
            getCurrentOrganization()
        );
    }

    @Transactional
    public OrganizationSettingsResponse
        updateOrganization(
            OrganizationSettingsRequest request
        ) {

        Organization organization =
            getCurrentOrganization();

        organization.setName(
            request.getName().trim()
        );

        organization.setDocument(
            normalize(request.getDocument())
        );

        organization.setEmail(
            normalize(request.getEmail())
        );

        organization.setPhone(
            normalize(request.getPhone())
        );

        organization.setAddress(
            normalize(request.getAddress())
        );

        organization =
            organizationRepository.save(
                organization
            );

        return toResponse(
            organization
        );
    }

    @Transactional
    public OrganizationSettingsResponse
        updateModules(
            OrganizationModulesRequest request
        ) {

        Organization organization =
            getCurrentOrganization();

        Set<SystemModule> modules =
            new HashSet<>(
                request.getModules()
            );

        modules.add(
            SystemModule.SERVICES
        );

        organization.setEnabledModules(
            modules
        );

        organization =
            organizationRepository.save(
                organization
            );

        return toResponse(
            organization
        );
    }

    /*
     * =========================
     * PLANO E FATURAMENTO
     * =========================
     */

    @Transactional
    public BillingResponse getBilling() {

        Organization organization =
            getCurrentOrganization();

        boolean changed =
            initializeBillingIfNecessary(
                organization
            );

        if (changed) {

            organization =
                organizationRepository.save(
                    organization
                );
        }

        return toBillingResponse(
            organization
        );
    }

    @Transactional
    public BillingResponse updateBilling(
            BillingUpdateRequest request
    ) {

        Organization organization =
            getCurrentOrganization();

        LocalDate today =
            LocalDate.now();

        boolean planChanged =
            organization.getPlan()
                != request.getPlan();

        boolean cycleChanged =
            organization.getBillingCycle()
                != request.getBillingCycle();

        organization.setPlan(
            request.getPlan()
        );

        organization.setBillingCycle(
            request.getBillingCycle()
        );

        if (
            planChanged
            || cycleChanged
            || organization
                .getSubscriptionStartDate()
                == null
        ) {

            organization
                .setSubscriptionStartDate(
                    today
                );

            organization
                .setNextBillingDate(
                    calculateNextBillingDate(
                        today,
                        request.getBillingCycle()
                    )
                );
        }

        if (
            organization
                .getSubscriptionStatus()
                == null
        ) {

            organization
                .setSubscriptionStatus(
                    SubscriptionStatus.ACTIVE
                );
        }

        organization =
            organizationRepository.save(
                organization
            );

        return toBillingResponse(
            organization
        );
    }

    /*
     * =========================
     * CONFIGURAÇÕES DO SISTEMA
     * =========================
     */

    @Transactional(readOnly = true)
    public SystemSettingsResponse
        getSystemSettings() {

        Organization organization =
            getCurrentOrganization();

        return toSystemSettingsResponse(
            organization
        );
    }

    @Transactional
    public SystemSettingsResponse
        updateSystemSettings(
            SystemSettingsRequest request
        ) {

        validateTimezone(
            request.getTimezone()
        );

        String weekStartsOn =
            request
                .getWeekStartsOn()
                .trim()
                .toUpperCase();

        if (
            !weekStartsOn.equals("MONDAY")
            && !weekStartsOn.equals("SUNDAY")
        ) {

            throw new BusinessException(
                "O início da semana deve ser MONDAY ou SUNDAY."
            );
        }

        Organization organization =
            getCurrentOrganization();

        organization.setTimezone(
            request.getTimezone().trim()
        );

        organization.setDateFormat(
            request.getDateFormat().trim()
        );

        organization.setTimeFormat(
            request.getTimeFormat().trim()
        );

        organization.setWeekStartsOn(
            weekStartsOn
        );

        organization.setCurrency(
            request
                .getCurrency()
                .trim()
                .toUpperCase()
        );

        organization =
            organizationRepository.save(
                organization
            );

        return toSystemSettingsResponse(
            organization
        );
    }

    private void validateTimezone(
            String timezone
    ) {

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

    private SystemSettingsResponse
        toSystemSettingsResponse(
            Organization organization
        ) {

        return new SystemSettingsResponse(
            valueOrDefault(
                organization.getTimezone(),
                "America/Sao_Paulo"
            ),
            valueOrDefault(
                organization.getDateFormat(),
                "DD/MM/YYYY"
            ),
            valueOrDefault(
                organization.getTimeFormat(),
                "HH:mm"
            ),
            valueOrDefault(
                organization.getWeekStartsOn(),
                "MONDAY"
            ),
            valueOrDefault(
                organization.getCurrency(),
                "BRL"
            )
        );
    }

    private String valueOrDefault(
            String value,
            String defaultValue
    ) {

        if (
            value == null
            || value.isBlank()
        ) {

            return defaultValue;
        }

        return value;
    }

    private boolean initializeBillingIfNecessary(
            Organization organization
    ) {

        boolean changed =
            false;

        if (
            organization.getBillingCycle()
                == null
        ) {

            organization.setBillingCycle(
                BillingCycle.MONTHLY
            );

            changed =
                true;
        }

        if (
            organization
                .getSubscriptionStatus()
                == null
        ) {

            organization.setSubscriptionStatus(
                SubscriptionStatus.ACTIVE
            );

            changed =
                true;
        }

        LocalDate startDate =
            organization
                .getSubscriptionStartDate();

        if (startDate == null) {

            startDate =
                LocalDate.now();

            organization
                .setSubscriptionStartDate(
                    startDate
                );

            changed =
                true;
        }

        if (
            organization
                .getNextBillingDate()
                == null
        ) {

            organization
                .setNextBillingDate(
                    calculateNextBillingDate(
                        startDate,
                        organization
                            .getBillingCycle()
                    )
                );

            changed =
                true;
        }

        return changed;
    }

    private LocalDate calculateNextBillingDate(
            LocalDate date,
            BillingCycle cycle
    ) {

        if (
            cycle
                == BillingCycle.YEARLY
        ) {

            return date.plusYears(1);
        }

        return date.plusMonths(1);
    }

    private BillingResponse
        toBillingResponse(
            Organization organization
        ) {

        return new BillingResponse(
            organization.getPlan(),
            organization.getBillingCycle(),
            organization
                .getSubscriptionStatus(),
            organization
                .getSubscriptionStartDate(),
            organization
                .getNextBillingDate(),
            calculatePrice(
                organization.getPlan(),
                organization
                    .getBillingCycle()
            )
        );
    }

    private BigDecimal calculatePrice(
            PlanType plan,
            BillingCycle cycle
    ) {

        BigDecimal monthlyPrice =
            switch (plan) {

                case BASIC ->
                    new BigDecimal(
                        "49.90"
                    );

                case PRO ->
                    new BigDecimal(
                        "99.90"
                    );

                case PREMIUM ->
                    new BigDecimal(
                        "159.90"
                    );
            };

        if (
            cycle
                == BillingCycle.YEARLY
        ) {

            return monthlyPrice
                .multiply(
                    BigDecimal.TEN
                );
        }

        return monthlyPrice;
    }

    private Organization
        getCurrentOrganization() {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        return organizationRepository
            .findById(
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Organização não encontrada."
                    )
            );
    }

    private OrganizationSettingsResponse
        toResponse(
            Organization organization
        ) {

        Set<SystemModule> modules =
            organization
                .getEnabledModules();

        if (modules == null) {
            modules = new HashSet<>();
        }

        modules =
            new HashSet<>(
                modules
            );

        modules.add(
            SystemModule.SERVICES
        );

        return new OrganizationSettingsResponse(
            organization.getId(),
            organization.getName(),
            organization.getDocument(),
            organization.getEmail(),
            organization.getPhone(),
            organization.getAddress(),
            organization.getPlan(),
            modules
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
}