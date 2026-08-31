package br.com.prestify.repository;

import br.com.prestify.entity.FinancialTransaction;

import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;

import java.math.BigDecimal;

import java.time.LocalDate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

public interface FinancialRepository
        extends JpaRepository<
            FinancialTransaction,
            Long
        > {

    Optional<FinancialTransaction>
        findByIdAndOrganizationId(
            Long id,
            Long organizationId
        );

    Page<FinancialTransaction>
        findByOrganizationIdOrderByCreatedAtDesc(
            Long organizationId,
            Pageable pageable
        );

    boolean
        existsByOrganizationIdAndExternalReference(
            Long organizationId,
            String externalReference
        );

    /*
     * Listagem geral do financeiro.
     *
     * O filtro de período permanece
     * baseado na data de vencimento,
     * pois esta tela representa os
     * lançamentos financeiros e seus
     * vencimentos.
     */
    @Query("""
        SELECT f
        FROM FinancialTransaction f
        WHERE f.organization.id = :organizationId

        AND (
            :search IS NULL
            OR LOWER(f.description)
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
            OR LOWER(f.category)
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
        )

        AND (
            :type IS NULL
            OR f.type = :type
        )

        AND (
            :status IS NULL
            OR f.status = :status
        )

        AND (
            :startDate IS NULL
            OR f.dueDate >= :startDate
        )

        AND (
            :endDate IS NULL
            OR f.dueDate <= :endDate
        )
        """)
    Page<FinancialTransaction>
        search(
            @Param(
                "organizationId"
            )
            Long organizationId,

            @Param("search")
            String search,

            @Param("type")
            FinancialType type,

            @Param("status")
            FinancialStatus status,

            @Param("startDate")
            LocalDate startDate,

            @Param("endDate")
            LocalDate endDate,

            Pageable pageable
        );

    /*
     * Totais financeiros:
     *
     * PAID
     * -> utiliza paymentDate
     *
     * PENDING
     * -> utiliza dueDate
     */
    @Query("""
        SELECT COALESCE(
            SUM(f.amount),
            0
        )
        FROM FinancialTransaction f
        WHERE f.organization.id = :organizationId
        AND f.type = :type
        AND f.status = :status
        AND (
            (
                f.status =
                    br.com.prestify.enums.FinancialStatus.PAID
                AND (
                    :startDate IS NULL
                    OR f.paymentDate >= :startDate
                )
                AND (
                    :endDate IS NULL
                    OR f.paymentDate <= :endDate
                )
            )
            OR
            (
                f.status <>
                    br.com.prestify.enums.FinancialStatus.PAID
                AND (
                    :startDate IS NULL
                    OR f.dueDate >= :startDate
                )
                AND (
                    :endDate IS NULL
                    OR f.dueDate <= :endDate
                )
            )
        )
        """)
    BigDecimal sumByTypeAndStatus(
        @Param(
            "organizationId"
        )
        Long organizationId,

        @Param("type")
        FinancialType type,

        @Param("status")
        FinancialStatus status,

        @Param("startDate")
        LocalDate startDate,

        @Param("endDate")
        LocalDate endDate
    );

    /*
     * Fluxo financeiro realizado.
     */
    @Query("""
        SELECT f
        FROM FinancialTransaction f
        WHERE f.organization.id = :organizationId
        AND f.status =
            br.com.prestify.enums.FinancialStatus.PAID
        AND f.paymentDate IS NOT NULL
        AND f.paymentDate >= :startDate
        AND f.paymentDate <= :endDate
        ORDER BY
            f.paymentDate ASC,
            f.id ASC
        """)
    List<FinancialTransaction>
        findPaidInPeriod(
            @Param(
                "organizationId"
            )
            Long organizationId,

            @Param("startDate")
            LocalDate startDate,

            @Param("endDate")
            LocalDate endDate
        );
}