package br.com.prestify.service;

import br.com.prestify.dto.financial.FinancialCreateRequest;
import br.com.prestify.dto.financial.FinancialResponse;
import br.com.prestify.dto.financial.FinancialStatusRequest;
import br.com.prestify.dto.financial.FinancialSummaryResponse;
import br.com.prestify.dto.financial.FinancialUpdateRequest;

import br.com.prestify.entity.Client;
import br.com.prestify.entity.FinancialTransaction;
import br.com.prestify.entity.Organization;
import br.com.prestify.entity.Supplier;
import br.com.prestify.entity.User;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.FinancialSource;
import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.ClientRepository;
import br.com.prestify.repository.FinancialRepository;
import br.com.prestify.repository.SupplierRepository;

import br.com.prestify.rules.PlanRules;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;

import java.time.LocalDate;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinancialService {

    private final FinancialRepository
        financialRepository;

    private final ClientRepository
        clientRepository;

    private final SupplierRepository
        supplierRepository;

    private final CurrentUserService
        currentUserService;

    public FinancialService(
            FinancialRepository financialRepository,
            ClientRepository clientRepository,
            SupplierRepository supplierRepository,
            CurrentUserService currentUserService
    ) {

        this.financialRepository =
            financialRepository;

        this.clientRepository =
            clientRepository;

        this.supplierRepository =
            supplierRepository;

        this.currentUserService =
            currentUserService;
    }

    /*
     * =========================
     * LANÇAMENTO MANUAL
     * =========================
     */

    @Transactional
    public FinancialResponse create(
            FinancialCreateRequest request
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        Client client =
            findClientIfPresent(
                request.getClientId(),
                organizationId
            );

        Supplier supplier =
            findSupplierIfPresent(
                request.getSupplierId(),
                organizationId
            );

        validateRelations(
            request.getType(),
            client,
            supplier
        );

        User currentUser =
            currentUserService
                .getCurrentUser();

        FinancialTransaction transaction =
            new FinancialTransaction();

        transaction.setDescription(
            request
                .getDescription()
                .trim()
        );

        transaction.setType(
            request.getType()
        );

        transaction.setAmount(
            request.getAmount()
        );

        transaction.setCategory(
            normalizeNullable(
                request.getCategory()
            )
        );

        transaction.setDueDate(
            request.getDueDate()
        );

        transaction.setClient(
            client
        );

        transaction.setSupplier(
            supplier
        );

        transaction.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        transaction.setStatus(
            FinancialStatus.PENDING
        );

        transaction.setPaymentMethod(
            null
        );

        transaction.setPaymentDate(
            null
        );

        transaction.setSource(
            FinancialSource.MANUAL
        );

        transaction.setExternalReference(
            null
        );

        transaction.setCreatedBy(
            currentUser
        );

        transaction.setOrganization(
            currentUser
                .getOrganization()
        );

        return toResponse(
            financialRepository.save(
                transaction
            )
        );
    }

    /*
     * =========================
     * COBRANÇA ADMINISTRATIVA
     * DA ASSINATURA
     * =========================
     *
     * Usada quando plano ou ciclo
     * são alterados manualmente.
     *
     * Cada alteração é um evento
     * independente, por isso a
     * referência continua usando UUID.
     */

    @Transactional
    public void createSubscriptionCharge(
            Organization organization,
            LocalDate chargeDate
    ) {

        validateOrganizationForCharge(
            organization
        );

        LocalDate effectiveChargeDate =
            chargeDate == null
                ? LocalDate.now()
                : chargeDate;

        String reference =
            buildAdministrativeSubscriptionReference(
                organization,
                effectiveChargeDate
            );

        boolean alreadyExists =
            financialRepository
                .existsByOrganizationIdAndExternalReference(
                    organization.getId(),
                    reference
                );

        if (alreadyExists) {
            return;
        }

        createSubscriptionTransaction(
            organization,
            effectiveChargeDate,
            reference,
            "Cobrança administrativa da assinatura Prestify."
        );
    }

    /*
     * =========================
     * COBRANÇA RECORRENTE
     * =========================
     *
     * Para a cobrança automática,
     * a referência é determinística.
     *
     * Uma organização só pode ter
     * uma cobrança automática para
     * a mesma data de competência.
     */

    @Transactional
    public boolean
        createRecurringSubscriptionCharge(
            Organization organization,
            LocalDate billingDate
        ) {

        validateOrganizationForCharge(
            organization
        );

        if (billingDate == null) {

            throw new BusinessException(
                "A data da cobrança recorrente é obrigatória."
            );
        }

        String reference =
            buildRecurringSubscriptionReference(
                organization,
                billingDate
            );

        boolean alreadyExists =
            financialRepository
                .existsByOrganizationIdAndExternalReference(
                    organization.getId(),
                    reference
                );

        if (alreadyExists) {
            return false;
        }

        createSubscriptionTransaction(
            organization,
            billingDate,
            reference,
            "Cobrança recorrente automática da assinatura Prestify."
        );

        return true;
    }

    private void createSubscriptionTransaction(
            Organization organization,
            LocalDate chargeDate,
            String reference,
            String originDescription
    ) {

        BigDecimal amount =
            calculateSubscriptionPrice(
                organization
            );

        String planName =
            PlanRules
                .getDisplayName(
                    organization
                        .getPlan()
                );

        String cycleName =
            organization
                .getBillingCycle()
                == BillingCycle.YEARLY
                    ? "Anual"
                    : "Mensal";

        FinancialTransaction transaction =
            new FinancialTransaction();

        transaction.setDescription(
            "Assinatura Prestify - Plano "
                + planName
        );

        transaction.setType(
            FinancialType.EXPENSE
        );

        transaction.setAmount(
            amount
        );

        transaction.setCategory(
            "Assinatura Prestify"
        );

        transaction.setStatus(
            FinancialStatus.PENDING
        );

        transaction.setPaymentMethod(
            null
        );

        transaction.setPaymentDate(
            null
        );

        transaction.setDueDate(
            chargeDate
        );

        transaction.setSupplier(
            null
        );

        transaction.setClient(
            null
        );

        transaction.setNotes(
            originDescription
                + " Plano: "
                + planName
                + ". Ciclo: "
                + cycleName
                + ". Competência: "
                + chargeDate
                + "."
        );

        transaction.setSource(
            FinancialSource.SUBSCRIPTION
        );

        transaction.setExternalReference(
            reference
        );

        transaction.setCreatedBy(
            null
        );

        transaction.setOrganization(
            organization
        );

        financialRepository.save(
            transaction
        );
    }

    private void
        validateOrganizationForCharge(
            Organization organization
        ) {

        if (
            organization == null
            || organization.getId()
                == null
        ) {

            throw new BusinessException(
                "Não foi possível gerar a cobrança da assinatura."
            );
        }

        if (
            organization.getPlan()
                == null
        ) {

            throw new BusinessException(
                "A organização não possui um plano válido."
            );
        }

        if (
            organization
                .getBillingCycle()
                == null
        ) {

            throw new BusinessException(
                "A organização não possui um ciclo de cobrança válido."
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<FinancialResponse> list(
            String search,
            FinancialType type,
            FinancialStatus status,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {

        validatePagination(
            page,
            size
        );

        validateDateRange(
            startDate,
            endDate
        );

        Long organizationId =
            currentUserService
                .getOrganizationId();

        return financialRepository
            .search(
                organizationId,
                normalizeNullable(
                    search
                ),
                type,
                status,
                startDate,
                endDate,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.DESC,
                        "dueDate"
                    ).and(
                        Sort.by(
                            Sort.Direction.DESC,
                            "id"
                        )
                    )
                )
            )
            .map(
                this::toResponse
            );
    }

    @Transactional(readOnly = true)
    public FinancialResponse getById(
            Long id
    ) {

        return toResponse(
            findTransaction(
                id,
                currentUserService
                    .getOrganizationId()
            )
        );
    }

    @Transactional(readOnly = true)
    public FinancialSummaryResponse
        getSummary(
            LocalDate startDate,
            LocalDate endDate
        ) {

        validateDateRange(
            startDate,
            endDate
        );

        Long organizationId =
            currentUserService
                .getOrganizationId();

        BigDecimal paidIncome =
            getTotal(
                organizationId,
                FinancialType.INCOME,
                FinancialStatus.PAID,
                startDate,
                endDate
            );

        BigDecimal paidExpense =
            getTotal(
                organizationId,
                FinancialType.EXPENSE,
                FinancialStatus.PAID,
                startDate,
                endDate
            );

        BigDecimal receivable =
            getTotal(
                organizationId,
                FinancialType.INCOME,
                FinancialStatus.PENDING,
                startDate,
                endDate
            );

        BigDecimal payable =
            getTotal(
                organizationId,
                FinancialType.EXPENSE,
                FinancialStatus.PENDING,
                startDate,
                endDate
            );

        BigDecimal profit =
            paidIncome.subtract(
                paidExpense
            );

        return new FinancialSummaryResponse(
            paidIncome,
            paidExpense,
            profit,
            receivable,
            payable
        );
    }

    @Transactional
    public FinancialResponse update(
            Long id,
            FinancialUpdateRequest request
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        FinancialTransaction transaction =
            findTransaction(
                id,
                organizationId
            );

        if (
            transaction.getSource()
                == FinancialSource.SUBSCRIPTION
        ) {

            throw new BusinessException(
                "Cobranças da assinatura Prestify não podem ser editadas manualmente."
            );
        }

        if (
            transaction.getStatus()
                != FinancialStatus.PENDING
        ) {

            throw new BusinessException(
                "Somente lançamentos pendentes podem ser editados."
            );
        }

        Client client =
            findClientIfPresent(
                request.getClientId(),
                organizationId
            );

        Supplier supplier =
            findSupplierIfPresent(
                request.getSupplierId(),
                organizationId
            );

        validateRelations(
            request.getType(),
            client,
            supplier
        );

        transaction.setDescription(
            request
                .getDescription()
                .trim()
        );

        transaction.setType(
            request.getType()
        );

        transaction.setAmount(
            request.getAmount()
        );

        transaction.setCategory(
            normalizeNullable(
                request.getCategory()
            )
        );

        transaction.setDueDate(
            request.getDueDate()
        );

        transaction.setClient(
            client
        );

        transaction.setSupplier(
            supplier
        );

        transaction.setNotes(
            normalizeNullable(
                request.getNotes()
            )
        );

        return toResponse(
            financialRepository.save(
                transaction
            )
        );
    }

    @Transactional
    public FinancialResponse
        changeStatus(
            Long id,
            FinancialStatusRequest request
        ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        FinancialTransaction transaction =
            findTransaction(
                id,
                organizationId
            );

        if (
            transaction.getStatus()
                != FinancialStatus.PENDING
        ) {

            throw new BusinessException(
                "Este lançamento financeiro já foi finalizado."
            );
        }

        if (
            request.getStatus()
                == FinancialStatus.PENDING
        ) {

            throw new BusinessException(
                "O lançamento já está pendente."
            );
        }

        if (
            transaction.getSource()
                == FinancialSource.SUBSCRIPTION
            &&
            request.getStatus()
                == FinancialStatus.CANCELLED
        ) {

            throw new BusinessException(
                "Cobranças da assinatura Prestify não podem ser canceladas manualmente."
            );
        }

        if (
            request.getStatus()
                == FinancialStatus.PAID
        ) {

            if (
                request
                    .getPaymentMethod()
                    == null
            ) {

                throw new BusinessException(
                    "A forma de pagamento é obrigatória para concluir o pagamento."
                );
            }

            LocalDate paymentDate =
                request.getPaymentDate();

            if (
                paymentDate == null
            ) {

                paymentDate =
                    LocalDate.now();
            }

            transaction.setStatus(
                FinancialStatus.PAID
            );

            transaction.setPaymentMethod(
                request
                    .getPaymentMethod()
            );

            transaction.setPaymentDate(
                paymentDate
            );

        } else if (
            request.getStatus()
                == FinancialStatus.CANCELLED
        ) {

            transaction.setStatus(
                FinancialStatus.CANCELLED
            );

            transaction.setPaymentMethod(
                null
            );

            transaction.setPaymentDate(
                null
            );

        } else {

            throw new BusinessException(
                "Status financeiro inválido."
            );
        }

        return toResponse(
            financialRepository.save(
                transaction
            )
        );
    }

    @Transactional
    public void delete(
            Long id
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        FinancialTransaction transaction =
            findTransaction(
                id,
                organizationId
            );

        if (
            transaction.getSource()
                == FinancialSource.SUBSCRIPTION
        ) {

            throw new BusinessException(
                "Cobranças da assinatura Prestify não podem ser excluídas."
            );
        }

        if (
            transaction.getStatus()
                == FinancialStatus.PAID
        ) {

            throw new BusinessException(
                "Um lançamento pago não pode ser excluído."
            );
        }

        if (
            transaction.getStatus()
                == FinancialStatus.CANCELLED
        ) {

            return;
        }

        transaction.setStatus(
            FinancialStatus.CANCELLED
        );

        transaction.setPaymentMethod(
            null
        );

        transaction.setPaymentDate(
            null
        );

        financialRepository.save(
            transaction
        );
    }

    private BigDecimal
        calculateSubscriptionPrice(
            Organization organization
        ) {

        BigDecimal monthlyPrice =
            PlanRules
                .getMonthlyPrice(
                    organization
                        .getPlan()
                );

        if (
            organization
                .getBillingCycle()
                == BillingCycle.YEARLY
        ) {

            return monthlyPrice
                .multiply(
                    BigDecimal.TEN
                );
        }

        return monthlyPrice;
    }

    /*
     * Alterações administrativas de
     * plano/ciclo continuam sendo
     * eventos únicos.
     */
    private String
        buildAdministrativeSubscriptionReference(
            Organization organization,
            LocalDate chargeDate
        ) {

        return "PRESTIFY_SUBSCRIPTION_"
            + organization.getId()
            + "_"
            + organization
                .getPlan()
                .name()
            + "_"
            + organization
                .getBillingCycle()
                .name()
            + "_"
            + chargeDate
            + "_"
            + UUID.randomUUID();
    }

    /*
     * A referência recorrente não usa
     * UUID propositalmente.
     *
     * A mesma empresa e a mesma
     * competência sempre resultam na
     * mesma referência.
     */
    private String
        buildRecurringSubscriptionReference(
            Organization organization,
            LocalDate billingDate
        ) {

        return "PRESTIFY_RECURRING_"
            + organization.getId()
            + "_"
            + billingDate;
    }

    private BigDecimal getTotal(
            Long organizationId,
            FinancialType type,
            FinancialStatus status,
            LocalDate startDate,
            LocalDate endDate
    ) {

        BigDecimal total =
            financialRepository
                .sumByTypeAndStatus(
                    organizationId,
                    type,
                    status,
                    startDate,
                    endDate
                );

        return total == null
            ? BigDecimal.ZERO
            : total;
    }

    private void validateRelations(
            FinancialType type,
            Client client,
            Supplier supplier
    ) {

        if (type == null) {

            throw new BusinessException(
                "O tipo financeiro é obrigatório."
            );
        }

        if (
            type
                == FinancialType.INCOME
            && supplier != null
        ) {

            throw new BusinessException(
                "Uma receita não pode estar vinculada a um fornecedor."
            );
        }

        if (
            type
                == FinancialType.EXPENSE
            && client != null
        ) {

            throw new BusinessException(
                "Uma despesa não pode estar vinculada a um cliente."
            );
        }
    }

    private Client findClientIfPresent(
            Long clientId,
            Long organizationId
    ) {

        if (clientId == null) {

            return null;
        }

        Client client =
            clientRepository
                .findByIdAndOrganizationId(
                    clientId,
                    organizationId
                )
                .orElseThrow(
                    () ->
                        new ResourceNotFoundException(
                            "Cliente não encontrado."
                        )
                );

        if (
            !Boolean.TRUE.equals(
                client.getActive()
            )
        ) {

            throw new BusinessException(
                "O cliente informado está inativo."
            );
        }

        return client;
    }

    private Supplier
        findSupplierIfPresent(
            Long supplierId,
            Long organizationId
        ) {

        if (supplierId == null) {

            return null;
        }

        Supplier supplier =
            supplierRepository
                .findByIdAndOrganizationId(
                    supplierId,
                    organizationId
                )
                .orElseThrow(
                    () ->
                        new ResourceNotFoundException(
                            "Fornecedor não encontrado."
                        )
                );

        if (
            !Boolean.TRUE.equals(
                supplier.getActive()
            )
        ) {

            throw new BusinessException(
                "O fornecedor informado está inativo."
            );
        }

        return supplier;
    }

    private FinancialTransaction
        findTransaction(
            Long id,
            Long organizationId
        ) {

        return financialRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Lançamento financeiro não encontrado."
                    )
            );
    }

    private FinancialResponse toResponse(
            FinancialTransaction transaction
    ) {

        Supplier supplier =
            transaction
                .getSupplier();

        Client client =
            transaction
                .getClient();

        User createdBy =
            transaction
                .getCreatedBy();

        return new FinancialResponse(
            transaction.getId(),
            transaction.getDescription(),
            transaction
                .getType()
                .name(),
            transaction.getAmount(),
            transaction.getCategory(),
            transaction
                .getStatus()
                .name(),

            transaction
                .getPaymentMethod()
                == null
                    ? null
                    : transaction
                        .getPaymentMethod()
                        .name(),

            transaction.getDueDate(),
            transaction.getPaymentDate(),

            supplier == null
                ? null
                : supplier.getId(),

            supplier == null
                ? null
                : supplier.getName(),

            client == null
                ? null
                : client.getId(),

            client == null
                ? null
                : client.getName(),

            transaction.getNotes(),

            createdBy == null
                ? null
                : createdBy.getId(),

            createdBy == null
                ? "Prestify"
                : createdBy.getName(),

            transaction.getCreatedAt(),
            transaction.getUpdatedAt()
        );
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (
            startDate != null
            && endDate != null
            && startDate.isAfter(
                endDate
            )
        ) {

            throw new BusinessException(
                "A data inicial não pode ser posterior à data final."
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
            || size > 100
        ) {

            throw new BusinessException(
                "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }

    private String normalizeNullable(
            String value
    ) {

        if (
            value == null
            || value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }
}