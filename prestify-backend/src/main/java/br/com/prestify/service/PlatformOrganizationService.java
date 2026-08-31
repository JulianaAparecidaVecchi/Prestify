package br.com.prestify.service;

import br.com.prestify.dto.platform.PlatformOrganizationCreateRequest;
import br.com.prestify.dto.platform.PlatformOrganizationResponse;
import br.com.prestify.dto.platform.PlatformOrganizationUpdateRequest;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.Role;
import br.com.prestify.enums.SubscriptionStatus;
import br.com.prestify.enums.SystemModule;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.OrganizationRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import java.time.LocalDate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformOrganizationService {

    private final OrganizationRepository
        organizationRepository;

    private final UserRepository
        userRepository;

    private final PasswordEncoder
        passwordEncoder;

    private final FinancialService
        financialService;

    public PlatformOrganizationService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FinancialService financialService
    ) {

        this.organizationRepository =
            organizationRepository;

        this.userRepository =
            userRepository;

        this.passwordEncoder =
            passwordEncoder;

        this.financialService =
            financialService;
    }

    @Transactional(readOnly = true)
    public Page<PlatformOrganizationResponse>
        list(
            String search,
            Boolean active,
            int page,
            int size
    ) {

        validatePagination(
            page,
            size
        );

        String term =
            search == null
                ? ""
                : search.trim();

        Page<Organization>
            organizations =
                organizationRepository
                    .search(
                        term,
                        active,
                        PageRequest.of(
                            page,
                            size,
                            Sort.by(
                                Sort.Direction.ASC,
                                "name"
                            )
                        )
                    );

        return organizations.map(
            this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PlatformOrganizationResponse
        getById(
            Long id
    ) {

        return toResponse(
            findOrganization(id)
        );
    }

    @Transactional
    public PlatformOrganizationResponse
        create(
            PlatformOrganizationCreateRequest request
        ) {

        validatePlan(
            request.getPlan()
        );

        validateBillingCycle(
            request.getBillingCycle()
        );

        String document =
            normalizeAndValidateCnpj(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            null
        );

        String phone =
            normalizeAndValidatePhone(
                request.getPhone()
            );

        String ownerEmail =
            normalizeEmail(
                request.getOwnerEmail()
            );

        if (
            userRepository
                .existsByEmailIgnoreCase(
                    ownerEmail
                )
        ) {

            throw new BusinessException(
                "O e-mail informado para o proprietário já está cadastrado."
            );
        }

        Organization organization =
            new Organization();

        organization.setName(
            request
                .getName()
                .trim()
        );

        organization.setDocument(
            document
        );

        organization.setEmail(
            normalizeOptionalEmail(
                request.getEmail()
            )
        );

        organization.setPhone(
            phone
        );

        organization.setAddress(
            normalizeOptional(
                request.getAddress()
            )
        );

        organization.setPlan(
            request.getPlan()
        );

        /*
         * Empresa nova começa com
         * todos os módulos disponíveis
         * no plano escolhido.
         */
        organization.setEnabledModules(
            PlanRules.getDefaultModules(
                request.getPlan()
            )
        );

        organization.setBillingCycle(
            request.getBillingCycle()
        );

        organization.setSubscriptionStatus(
            SubscriptionStatus.ACTIVE
        );

        organization.setActive(
            true
        );

        LocalDate today =
            LocalDate.now();

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

        organization =
            organizationRepository
                .save(organization);

        User owner =
            new User();

        owner.setName(
            request
                .getOwnerName()
                .trim()
        );

        owner.setEmail(
            ownerEmail
        );

        owner.setPassword(
            passwordEncoder.encode(
                request
                    .getOwnerPassword()
            )
        );

        owner.setRole(
            Role.OWNER
        );

        owner.setActive(
            true
        );

        owner.setOrganization(
            organization
        );

        userRepository.save(
            owner
        );

        /*
         * IMPORTANTE:
         *
         * Não criamos cobrança aqui.
         *
         * A criação de uma empresa
         * pelo SUPER_ADMIN continua
         * separada da cobrança.
         *
         * A cobrança administrativa
         * será criada quando houver
         * alteração de plano ou ciclo
         * em uma empresa existente.
         */
        return toResponse(
            organization
        );
    }

    @Transactional
    public PlatformOrganizationResponse
        update(
            Long id,
            PlatformOrganizationUpdateRequest request
    ) {

        Organization organization =
            findOrganization(id);

        validatePlan(
            request.getPlan()
        );

        validateBillingCycle(
            request.getBillingCycle()
        );

        if (
            request.getSubscriptionStatus()
                == null
        ) {

            throw new BusinessException(
                "Informe o status da assinatura."
            );
        }

        String document =
            normalizeAndValidateCnpj(
                request.getDocument()
            );

        validateDocumentAvailable(
            document,
            organization.getId()
        );

        String phone =
            normalizeAndValidatePhone(
                request.getPhone()
            );

        PlanType previousPlan =
            organization.getPlan();

        PlanType newPlan =
            request.getPlan();

        BillingCycle previousCycle =
            organization
                .getBillingCycle();

        BillingCycle newCycle =
            request
                .getBillingCycle();

        boolean planChanged =
            previousPlan != newPlan;

        boolean billingChanged =
            previousCycle != newCycle;

        /*
         * Antes de permitir a troca
         * de plano, verificamos se
         * os usuários ativos cabem
         * no novo limite.
         */
        if (planChanged) {

            validateActiveUserLimit(
                organization,
                newPlan
            );
        }

        /*
         * Guardamos os módulos antes
         * da alteração do plano.
         */
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

        organization.setName(
            request
                .getName()
                .trim()
        );

        organization.setDocument(
            document
        );

        organization.setEmail(
            normalizeOptionalEmail(
                request.getEmail()
            )
        );

        organization.setPhone(
            phone
        );

        organization.setAddress(
            normalizeOptional(
                request.getAddress()
            )
        );

        if (planChanged) {

            applyPlanChange(
                organization,
                previousPlan,
                newPlan,
                previousEnabledModules
            );

        } else {

            organization.setPlan(
                newPlan
            );
        }

        organization.setBillingCycle(
            newCycle
        );

        organization
            .setSubscriptionStatus(
                request
                    .getSubscriptionStatus()
            );

        /*
         * Se plano ou ciclo mudou,
         * reiniciamos as datas da
         * assinatura.
         */
        if (
            planChanged
            ||
            billingChanged
        ) {

            LocalDate today =
                LocalDate.now();

            organization
                .setSubscriptionStartDate(
                    today
                );

            organization
                .setNextBillingDate(
                    calculateNextBillingDate(
                        today,
                        newCycle
                    )
                );
        }

        organization =
            organizationRepository
                .save(organization);

        /*
         * CORREÇÃO DO FLUXO
         * DO SUPER_ADMIN
         *
         * O SettingsService já cria
         * cobrança quando o OWNER
         * altera o próprio plano.
         *
         * Aqui fazemos o equivalente
         * somente quando a alteração
         * foi feita pelo fluxo da
         * plataforma.
         *
         * Alterações simples como
         * nome, CNPJ, telefone,
         * endereço ou status da
         * assinatura não geram
         * cobrança nova.
         */
        if (
            planChanged
            ||
            billingChanged
        ) {

            financialService
                .createSubscriptionCharge(
                    organization,
                    LocalDate.now()
                );
        }

        return toResponse(
            organization
        );
    }

    @Transactional
    public PlatformOrganizationResponse
        changeStatus(
            Long id,
            Boolean active
    ) {

        if (active == null) {

            throw new BusinessException(
                "Informe o status da empresa."
            );
        }

        Organization organization =
            findOrganization(id);

        if (
            active.equals(
                organization.getActive()
            )
        ) {

            return toResponse(
                organization
            );
        }

        organization.setActive(
            active
        );

        /*
         * Suspensão ou reativação
         * invalida as sessões atuais
         * dos usuários da empresa.
         */
        List<User> users =
            userRepository
                .findByOrganizationId(
                    organization.getId()
                );

        for (
            User user :
            users
        ) {

            user.incrementTokenVersion();
        }

        userRepository.saveAll(
            users
        );

        organization =
            organizationRepository
                .save(organization);

        return toResponse(
            organization
        );
    }

    private void applyPlanChange(
            Organization organization,
            PlanType previousPlan,
            PlanType newPlan,
            Set<SystemModule> previousEnabledModules
    ) {

        Set<SystemModule>
            previousAllowedModules =
                PlanRules
                    .getAllowedModules(
                        previousPlan
                    );

        Set<SystemModule>
            newAllowedModules =
                PlanRules
                    .getAllowedModules(
                        newPlan
                    );

        Set<SystemModule>
            newEnabledModules =
                new HashSet<>(
                    previousEnabledModules
                );

        /*
         * Módulos que passaram a
         * estar disponíveis somente
         * no novo plano.
         */
        Set<SystemModule>
            newlyAvailableModules =
                new HashSet<>(
                    newAllowedModules
                );

        newlyAvailableModules
            .removeAll(
                previousAllowedModules
            );

        /*
         * Upgrade:
         * novos módulos entram
         * habilitados.
         */
        newEnabledModules.addAll(
            newlyAvailableModules
        );

        /*
         * Downgrade:
         * remove módulos que não
         * pertencem ao novo plano.
         */
        newEnabledModules.retainAll(
            newAllowedModules
        );

        /*
         * Serviços permanece
         * obrigatório.
         */
        newEnabledModules.add(
            SystemModule.SERVICES
        );

        organization.setPlan(
            newPlan
        );

        organization.setEnabledModules(
            newEnabledModules
        );
    }

    private void validateActiveUserLimit(
            Organization organization,
            PlanType newPlan
    ) {

        long activeUsers =
            userRepository
                .countByOrganizationIdAndActiveTrue(
                    organization.getId()
                );

        if (
            PlanRules
                .supportsActiveUserCount(
                    newPlan,
                    activeUsers
                )
        ) {

            return;
        }

        int maximumUsers =
            PlanRules
                .getMaxActiveUsers(
                    newPlan
                );

        throw new BusinessException(
            "Não é possível alterar para o plano "
            +
            PlanRules.getDisplayName(
                newPlan
            )
            +
            ". A empresa possui "
            +
            activeUsers
            +
            " usuários ativos, mas esse plano permite no máximo "
            +
            maximumUsers
            +
            "."
        );
    }

    private void validatePlan(
            PlanType plan
    ) {

        if (plan == null) {

            throw new BusinessException(
                "Informe o plano da empresa."
            );
        }
    }

    private void validateBillingCycle(
            BillingCycle billingCycle
    ) {

        if (
            billingCycle == null
        ) {

            throw new BusinessException(
                "Informe o ciclo de cobrança."
            );
        }
    }

    private Organization
        findOrganization(
            Long id
        ) {

        return organizationRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Empresa não encontrada."
                    )
            );
    }

    private void validateDocumentAvailable(
            String document,
            Long currentOrganizationId
    ) {

        if (document == null) {
            return;
        }

        boolean exists;

        if (
            currentOrganizationId
                == null
        ) {

            exists =
                organizationRepository
                    .existsByDocumentIgnoreCase(
                        document
                    );

        } else {

            exists =
                organizationRepository
                    .existsByDocumentIgnoreCaseAndIdNot(
                        document,
                        currentOrganizationId
                    );
        }

        if (exists) {

            throw new BusinessException(
                "Já existe uma empresa cadastrada com este CNPJ."
            );
        }
    }

    private void validatePagination(
            int page,
            int size
    ) {

        if (page < 0) {

            throw new BusinessException(
                "A página não pode ser negativa."
            );
        }

        if (
            size < 1
            ||
            size > 100
        ) {

            throw new BusinessException(
                "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }

    private LocalDate
        calculateNextBillingDate(
            LocalDate startDate,
            BillingCycle billingCycle
    ) {

        if (
            billingCycle
                == BillingCycle.YEARLY
        ) {

            return startDate
                .plusYears(1);
        }

        return startDate
            .plusMonths(1);
    }

    private String normalizeAndValidateCnpj(
            String value
    ) {

        String normalized =
            normalizeOptional(
                value
            );

        if (normalized == null) {
            return null;
        }

        String cnpj =
            onlyDigits(
                normalized
            );

        if (
            cnpj.length() != 14
        ) {

            throw new BusinessException(
                "O CNPJ deve possuir 14 dígitos."
            );
        }

        if (
            !isValidCnpj(cnpj)
        ) {

            throw new BusinessException(
                "Informe um CNPJ válido."
            );
        }

        return cnpj;
    }

    private boolean isValidCnpj(
            String cnpj
    ) {

        if (
            cnpj == null
            ||
            cnpj.length() != 14
        ) {

            return false;
        }

        boolean allEqual =
            true;

        char first =
            cnpj.charAt(0);

        for (
            int i = 1;
            i < cnpj.length();
            i++
        ) {

            if (
                cnpj.charAt(i)
                    != first
            ) {

                allEqual =
                    false;

                break;
            }
        }

        if (allEqual) {
            return false;
        }

        int[] firstWeights = {
            5,
            4,
            3,
            2,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2
        };

        int firstDigit =
            calculateCnpjDigit(
                cnpj.substring(
                    0,
                    12
                ),
                firstWeights
            );

        if (
            firstDigit
                != Character
                    .getNumericValue(
                        cnpj.charAt(12)
                    )
        ) {

            return false;
        }

        int[] secondWeights = {
            6,
            5,
            4,
            3,
            2,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2
        };

        int secondDigit =
            calculateCnpjDigit(
                cnpj.substring(
                    0,
                    13
                ),
                secondWeights
            );

        return secondDigit
            == Character
                .getNumericValue(
                    cnpj.charAt(13)
                );
    }

    private int calculateCnpjDigit(
            String base,
            int[] weights
    ) {

        int sum =
            0;

        for (
            int i = 0;
            i < base.length();
            i++
        ) {

            int digit =
                Character
                    .getNumericValue(
                        base.charAt(i)
                    );

            sum +=
                digit *
                weights[i];
        }

        int remainder =
            sum % 11;

        if (
            remainder < 2
        ) {

            return 0;
        }

        return 11 - remainder;
    }

    private String normalizeAndValidatePhone(
            String value
    ) {

        String normalized =
            normalizeOptional(
                value
            );

        if (normalized == null) {
            return null;
        }

        String phone =
            onlyDigits(
                normalized
            );

        if (
            phone.length() != 10
            &&
            phone.length() != 11
        ) {

            throw new BusinessException(
                "Informe um telefone válido com DDD."
            );
        }

        return phone;
    }

    private String onlyDigits(
            String value
    ) {

        if (value == null) {
            return null;
        }

        return value.replaceAll(
            "\\D",
            ""
        );
    }

    private String normalizeEmail(
            String value
    ) {

        if (
            value == null
            ||
            value.isBlank()
        ) {

            throw new BusinessException(
                "Informe o e-mail do proprietário."
            );
        }

        return value
            .trim()
            .toLowerCase();
    }

    private String normalizeOptionalEmail(
            String value
    ) {

        String normalized =
            normalizeOptional(
                value
            );

        if (normalized == null) {
            return null;
        }

        return normalized
            .toLowerCase();
    }

    private String normalizeOptional(
            String value
    ) {

        if (
            value == null
            ||
            value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }

    private PlatformOrganizationResponse
        toResponse(
            Organization organization
        ) {

        User owner =
            userRepository
                .findFirstByOrganizationIdAndRoleOrderByIdAsc(
                    organization.getId(),
                    Role.OWNER
                )
                .orElse(null);

        long activeUsers =
            userRepository
                .countByOrganizationIdAndActiveTrue(
                    organization.getId()
                );

        return new PlatformOrganizationResponse(
            organization.getId(),
            organization.getName(),
            organization.getDocument(),
            organization.getEmail(),
            organization.getPhone(),
            organization.getAddress(),
            organization.getActive(),
            organization.getPlan(),
            organization.getBillingCycle(),
            organization.getSubscriptionStatus(),
            organization.getSubscriptionStartDate(),
            organization.getNextBillingDate(),
            organization
                .getEnabledModules()
                == null
                    ? new HashSet<>()
                    : new HashSet<>(
                        organization
                            .getEnabledModules()
                    ),
            activeUsers,
            owner == null
                ? null
                : owner.getId(),
            owner == null
                ? null
                : owner.getName(),
            owner == null
                ? null
                : owner.getEmail()
        );
    }
}