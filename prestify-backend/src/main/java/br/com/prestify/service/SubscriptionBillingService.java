package br.com.prestify.service;

import br.com.prestify.entity.Organization;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.SubscriptionStatus;

import br.com.prestify.exception.BusinessException;

import br.com.prestify.repository.OrganizationRepository;

import java.time.LocalDate;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionBillingService {

    private static final int
        MAX_CATCH_UP_CHARGES = 120;

    private final OrganizationRepository
        organizationRepository;

    private final FinancialService
        financialService;

    public SubscriptionBillingService(
            OrganizationRepository organizationRepository,
            FinancialService financialService
    ) {

        this.organizationRepository =
            organizationRepository;

        this.financialService =
            financialService;
    }

    /*
     * Apenas localiza quais empresas
     * precisam ser processadas.
     *
     * O processamento financeiro de
     * cada empresa acontece em outra
     * transação.
     */
    @Transactional(readOnly = true)
    public List<Long>
        findDueOrganizationIds(
            LocalDate date
        ) {

        LocalDate referenceDate =
            date == null
                ? LocalDate.now()
                : date;

        return organizationRepository
            .findDueSubscriptionOrganizationIds(
                SubscriptionStatus.ACTIVE,
                referenceDate
            );
    }

    /*
     * Cada organização é processada
     * em uma transação independente.
     *
     * Isso evita que um erro em uma
     * empresa reverta as cobranças
     * corretas das demais.
     */
    @Transactional
    public int processOrganization(
            Long organizationId,
            LocalDate processingDate
    ) {

        if (organizationId == null) {
            return 0;
        }

        LocalDate referenceDate =
            processingDate == null
                ? LocalDate.now()
                : processingDate;

        Organization organization =
            organizationRepository
                .findByIdForSubscriptionBilling(
                    organizationId
                )
                .orElse(null);

        if (organization == null) {
            return 0;
        }

        /*
         * Revalidamos dentro da
         * transação porque a empresa
         * pode ter sido suspensa entre
         * a busca inicial e o momento
         * do processamento.
         */
        if (
            !Boolean.TRUE.equals(
                organization.getActive()
            )
        ) {
            return 0;
        }

        if (
            organization
                .getSubscriptionStatus()
                != SubscriptionStatus.ACTIVE
        ) {
            return 0;
        }

        LocalDate nextBillingDate =
            organization
                .getNextBillingDate();

        if (
            nextBillingDate == null
            || nextBillingDate
                .isAfter(
                    referenceDate
                )
        ) {
            return 0;
        }

        if (
            organization
                .getBillingCycle()
                == null
        ) {

            throw new BusinessException(
                "A empresa "
                    + organization.getId()
                    + " não possui ciclo de cobrança definido."
            );
        }

        int processedCharges = 0;

        /*
         * Se a aplicação ficou parada
         * por algum período, recuperamos
         * as competências vencidas sem
         * perder nenhuma.
         *
         * Exemplo:
         *
         * nextBillingDate = 01/06
         * sistema volta em 01/09
         *
         * serão processadas as
         * competências:
         * 01/06
         * 01/07
         * 01/08
         * 01/09
         */
        while (
            !nextBillingDate
                .isAfter(
                    referenceDate
                )
        ) {

            if (
                processedCharges
                    >= MAX_CATCH_UP_CHARGES
            ) {

                throw new BusinessException(
                    "A empresa "
                        + organization.getId()
                        + " possui um número excessivo de cobranças pendentes."
                );
            }

            financialService
                .createRecurringSubscriptionCharge(
                    organization,
                    nextBillingDate
                );

            nextBillingDate =
                calculateNextBillingDate(
                    nextBillingDate,
                    organization
                        .getBillingCycle()
                );

            processedCharges++;
        }

        organization
            .setNextBillingDate(
                nextBillingDate
            );

        organizationRepository
            .save(
                organization
            );

        return processedCharges;
    }

    private LocalDate
        calculateNextBillingDate(
            LocalDate currentBillingDate,
            BillingCycle billingCycle
        ) {

        if (
            billingCycle
                == BillingCycle.YEARLY
        ) {

            return currentBillingDate
                .plusYears(1);
        }

        return currentBillingDate
            .plusMonths(1);
    }
}