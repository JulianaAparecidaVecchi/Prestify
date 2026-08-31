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
import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;

import java.util.HashSet;
import java.util.Set;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final OrganizationRepository
        organizationRepository;

    private final UserRepository
        userRepository;

    private final CurrentUserService
        currentUserService;

    private final FinancialService
        financialService;

    public SettingsService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            FinancialService financialService
    ) {

        this.organizationRepository =
            organizationRepository;

        this.userRepository =
            userRepository;

        this.currentUserService =
            currentUserService;

        this.financialService =
            financialService;
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
            request
                .getName()
                .trim()
        );

        organization.setDocument(
            normalize(
                request.getDocument()
            )
        );

        organization.setEmail(
            normalize(
                request.getEmail()
            )
        );

        organization.setPhone(
            normalize(
                request.getPhone()
            )
        );

        organization.setAddress(
            normalize(
                request.getAddress()
            )
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

        Set<SystemModule>
            requestedModules =
                request.getModules()
                    == null
                    ? new HashSet<>()
                    : new HashSet<>(
                        request
                            .getModules()
                    );

        requestedModules.add(
            SystemModule.SERVICES
        );

        Set<SystemModule>
            disallowedModules =
                PlanRules
                    .getDisallowedModules(
                        organization
                            .getPlan(),
                        requestedModules
                    );

        if (
            !disallowedModules
                .isEmpty()
        ) {

            String moduleNames =
                disallowedModules
                    .stream()
                    .map(
                        this::
                            formatModuleName
                    )
                    .sorted()
                    .collect(
                        Collectors
                            .joining(", ")
                    );

            throw new BusinessException(
                "O plano "
                    + PlanRules
                        .getDisplayName(
                            organization
                                .getPlan()
                        )
                    + " não permite os seguintes módulos: "
                    + moduleNames
                    + "."
            );
        }

        organization
            .setEnabledModules(
                requestedModules
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
    public BillingResponse
        getBilling() {

        Organization organization =
            getCurrentOrganization();

        boolean changed =
            initializeBillingIfNecessary(
                organization
            );

        if (changed) {

            organization =
                organizationRepository
                    .save(
                        organization
                    );
        }

        return toBillingResponse(
            organization
        );
    }

    @Transactional
    public BillingResponse
        updateBilling(
            BillingUpdateRequest request
        ) {

        if (
            request.getPlan()
                == null
        ) {

            throw new BusinessException(
                "Informe o plano."
            );
        }

        if (
            request
                .getBillingCycle()
                == null
        ) {

            throw new BusinessException(
                "Informe o ciclo de faturamento."
            );
        }

        Organization organization =
            getCurrentOrganization();

        PlanType currentPlan =
            organization.getPlan();

        if (currentPlan == null) {

            currentPlan =
                PlanType.BASIC;
        }

        PlanType newPlan =
            request.getPlan();

        validateUserLimitForPlan(
            organization,
            newPlan
        );

        LocalDate today =
            LocalDate.now();

        boolean planChanged =
            currentPlan
                != newPlan;

        boolean cycleChanged =
            organization
                .getBillingCycle()
                != request
                    .getBillingCycle();

        boolean billingChanged =
            planChanged
                || cycleChanged;

        Set<SystemModule>
            previousEnabledModules =
                organization
                    .getEnabledModules()
                    == null
                    ? new HashSet<>()
                    : new HashSet<>(
                        organization
                            .getEnabledModules()
                    );

        Set<SystemModule>
            oldAllowedModules =
                PlanRules
                    .getAllowedModules(
                        currentPlan
                    );

        Set<SystemModule>
            newAllowedModules =
                PlanRules
                    .getAllowedModules(
                        newPlan
                    );

        boolean isUpgrade =
            planChanged
            &&
            newAllowedModules.size()
                > oldAllowedModules.size();

        organization.setPlan(
            newPlan
        );

        if (planChanged) {

            if (isUpgrade) {

                Set<SystemModule>
                    upgradedModules =
                        new HashSet<>(
                            previousEnabledModules
                        );

                upgradedModules.addAll(
                    newAllowedModules
                );

                organization
                    .setEnabledModules(
                        upgradedModules
                    );

            } else {

                organization
                    .setEnabledModules(
                        PlanRules
                            .normalizeModules(
                                newPlan,
                                previousEnabledModules
                            )
                    );
            }
        }

        organization
            .setBillingCycle(
                request
                    .getBillingCycle()
            );

        boolean initializeSubscription =
            organization
                .getSubscriptionStartDate()
                == null;

        if (
            billingChanged
            || initializeSubscription
        ) {

            organization
                .setSubscriptionStartDate(
                    today
                );

            organization
                .setNextBillingDate(
                    calculateNextBillingDate(
                        today,
                        request
                            .getBillingCycle()
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

        /*
         * A cobrança só é criada
         * quando há uma alteração real
         * de plano/ciclo ou quando a
         * assinatura ainda não havia
         * sido inicializada.
         *
         * Apenas salvar novamente a
         * mesma configuração não cria
         * uma cobrança duplicada.
         */
        if (
            billingChanged
            || initializeSubscription
        ) {

            financialService
                .createSubscriptionCharge(
                    organization,
                    today
                );
        }

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
            !weekStartsOn.equals(
                "MONDAY"
            )
            &&
            !weekStartsOn.equals(
                "SUNDAY"
            )
        ) {

            throw new BusinessException(
                "O início da semana deve ser MONDAY ou SUNDAY."
            );
        }

        Organization organization =
            getCurrentOrganization();

        organization.setTimezone(
            request
                .getTimezone()
                .trim()
        );

        organization.setDateFormat(
            request
                .getDateFormat()
                .trim()
        );

        organization.setTimeFormat(
            request
                .getTimeFormat()
                .trim()
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

    private void
        validateUserLimitForPlan(
            Organization organization,
            PlanType plan
        ) {

        long activeUsers =
            userRepository
                .countByOrganizationIdAndActiveTrue(
                    organization
                        .getId()
                );

        if (
            PlanRules
                .supportsActiveUserCount(
                    plan,
                    activeUsers
                )
        ) {

            return;
        }

        int maximumUsers =
            PlanRules
                .getMaxActiveUsers(
                    plan
                );

        throw new BusinessException(
            "Não é possível alterar para o plano "
                + PlanRules
                    .getDisplayName(
                        plan
                    )
                + ". A empresa possui "
                + activeUsers
                + " usuários ativos, mas esse plano permite no máximo "
                + maximumUsers
                + ". Desative usuários antes de realizar o downgrade."
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
                organization
                    .getTimezone(),
                "America/Sao_Paulo"
            ),
            valueOrDefault(
                organization
                    .getDateFormat(),
                "DD/MM/YYYY"
            ),
            valueOrDefault(
                organization
                    .getTimeFormat(),
                "HH:mm"
            ),
            valueOrDefault(
                organization
                    .getWeekStartsOn(),
                "MONDAY"
            ),
            valueOrDefault(
                organization
                    .getCurrency(),
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

    private boolean
        initializeBillingIfNecessary(
            Organization organization
        ) {

        boolean changed =
            false;

        if (
            organization
                .getPlan()
                == null
        ) {

            organization.setPlan(
                PlanType.BASIC
            );

            changed = true;
        }

        if (
            organization
                .getBillingCycle()
                == null
        ) {

            organization
                .setBillingCycle(
                    BillingCycle.MONTHLY
                );

            changed = true;
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

            changed = true;
        }

        LocalDate startDate =
            organization
                .getSubscriptionStartDate();

        if (
            startDate == null
        ) {

            startDate =
                LocalDate.now();

            organization
                .setSubscriptionStartDate(
                    startDate
                );

            changed = true;
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

            changed = true;
        }

        Set<SystemModule>
            currentModules =
                organization
                    .getEnabledModules();

        Set<SystemModule>
            normalizedModules =
                PlanRules
                    .normalizeModules(
                        organization
                            .getPlan(),
                        currentModules
                    );

        if (
            currentModules == null
            ||
            !new HashSet<>(
                currentModules
            ).equals(
                normalizedModules
            )
        ) {

            organization
                .setEnabledModules(
                    normalizedModules
                );

            changed = true;
        }

        return changed;
    }

    private LocalDate
        calculateNextBillingDate(
            LocalDate date,
            BillingCycle cycle
        ) {

        if (
            cycle
                == BillingCycle.YEARLY
        ) {

            return date
                .plusYears(1);
        }

        return date
            .plusMonths(1);
    }

    private BillingResponse
        toBillingResponse(
            Organization organization
        ) {

        return new BillingResponse(
            organization.getPlan(),
            organization
                .getBillingCycle(),
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

    private BigDecimal
        calculatePrice(
            PlanType plan,
            BillingCycle cycle
        ) {

        BigDecimal monthlyPrice =
            PlanRules
                .getMonthlyPrice(
                    plan
                );

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
            PlanRules
                .normalizeModules(
                    organization
                        .getPlan(),
                    organization
                        .getEnabledModules()
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

    private String formatModuleName(
            SystemModule module
    ) {

        return switch (module) {

            case AGENDA ->
                "Agenda";

            case CLIENTS ->
                "Clientes";

            case SERVICES ->
                "Serviços";

            case PRODUCTS ->
                "Produtos";

            case STOCK ->
                "Estoque";

            case SUPPLIERS ->
                "Fornecedores";

            case FINANCIAL ->
                "Financeiro";

            case REPORTS ->
                "Relatórios";

            case USERS ->
                "Usuários";
        };
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