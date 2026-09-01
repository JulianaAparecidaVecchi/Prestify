package br.com.prestify.repository;

import br.com.prestify.entity.Organization;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import java.time.LocalDate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

public interface OrganizationRepository
        extends JpaRepository<Organization, Long> {

    boolean existsByDocumentIgnoreCase(
        String document
    );

    boolean existsByDocumentIgnoreCaseAndIdNot(
        String document,
        Long id
    );

    Optional<Organization>
        findByIdAndActiveTrue(
            Long id
        );

    long countByActiveTrue();

    long countByActiveFalse();

    long countByPlan(
        PlanType plan
    );

    long countBySubscriptionStatus(
        SubscriptionStatus status
    );

    long countByActiveTrueAndSubscriptionStatus(
        SubscriptionStatus status
    );

    List<Organization>
        findByActiveTrueAndSubscriptionStatus(
            SubscriptionStatus status
        );

    /*
     * Empresas com cobrança recorrente
     * vencida ou vencendo na data
     * informada.
     *
     * Retornamos apenas os IDs para
     * que cada organização seja
     * processada separadamente.
     */
    @Query("""
        SELECT o.id
        FROM Organization o
        WHERE o.active = true
        AND o.subscriptionStatus =
            :subscriptionStatus
        AND o.nextBillingDate IS NOT NULL
        AND o.nextBillingDate <= :date
        ORDER BY o.nextBillingDate ASC,
                 o.id ASC
        """)
    List<Long>
        findDueSubscriptionOrganizationIds(
            @Param("subscriptionStatus")
            SubscriptionStatus
                subscriptionStatus,

            @Param("date")
            LocalDate date
        );

    /*
     * Consulta utilizada durante o
     * processamento da cobrança.
     *
     * Não utilizamos PESSIMISTIC_WRITE
     * porque a combinação atual de
     * Hibernate e MariaDB gera
     * "FOR UPDATE OF alias", sintaxe
     * incompatível com o banco.
     */
    @Query("""
        SELECT o
        FROM Organization o
        WHERE o.id = :id
        """)
    Optional<Organization>
        findByIdForSubscriptionBilling(
            @Param("id")
            Long id
        );

    @Query("""
        SELECT o
        FROM Organization o
        WHERE
        (
            :active IS NULL
            OR o.active = :active
        )
        AND
        (
            :search = ''
            OR LOWER(o.name)
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
            OR LOWER(
                COALESCE(
                    o.document,
                    ''
                )
            )
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
            OR LOWER(
                COALESCE(
                    o.email,
                    ''
                )
            )
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
        )
        """)
    Page<Organization> search(
        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );

    @Query("""
        SELECT o
        FROM Organization o
        WHERE
        (
            :active IS NULL
            OR o.active = :active
        )
        AND
        (
            :plan IS NULL
            OR o.plan = :plan
        )
        AND
        (
            :billingCycle IS NULL
            OR o.billingCycle = :billingCycle
        )
        AND
        (
            :subscriptionStatus IS NULL
            OR o.subscriptionStatus =
                :subscriptionStatus
        )
        AND
        (
            :search = ''
            OR LOWER(o.name)
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
            OR LOWER(
                COALESCE(
                    o.document,
                    ''
                )
            )
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
            OR LOWER(
                COALESCE(
                    o.email,
                    ''
                )
            )
                LIKE LOWER(
                    CONCAT(
                        '%',
                        :search,
                        '%'
                    )
                )
        )
        """)
    Page<Organization> searchSubscriptions(
        @Param("search")
        String search,

        @Param("plan")
        PlanType plan,

        @Param("billingCycle")
        BillingCycle billingCycle,

        @Param("subscriptionStatus")
        SubscriptionStatus subscriptionStatus,

        @Param("active")
        Boolean active,

        Pageable pageable
    );
}