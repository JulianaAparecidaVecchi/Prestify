package br.com.prestify.service;

import br.com.prestify.dto.dashboard.DashboardResponse;
import br.com.prestify.dto.dashboard.RecentActivityResponse;

import br.com.prestify.entity.Appointment;
import br.com.prestify.entity.FinancialTransaction;
import br.com.prestify.entity.StockMovement;

import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;
import br.com.prestify.enums.StockMovementType;

import br.com.prestify.repository.AppointmentRepository;
import br.com.prestify.repository.ClientRepository;
import br.com.prestify.repository.FinancialRepository;
import br.com.prestify.repository.StockMovementRepository;
import br.com.prestify.repository.StockRepository;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final int
        ACTIVITIES_PER_SOURCE = 5;

    private static final int
        MAX_RECENT_ACTIVITIES = 8;

    private final AppointmentRepository
        appointmentRepository;

    private final ClientRepository
        clientRepository;

    private final FinancialRepository
        financialRepository;

    private final StockRepository
        stockRepository;

    private final StockMovementRepository
        stockMovementRepository;

    private final CurrentUserService
        currentUserService;

    public DashboardService(
            AppointmentRepository appointmentRepository,
            ClientRepository clientRepository,
            FinancialRepository financialRepository,
            StockRepository stockRepository,
            StockMovementRepository stockMovementRepository,
            CurrentUserService currentUserService
    ) {

        this.appointmentRepository =
            appointmentRepository;

        this.clientRepository =
            clientRepository;

        this.financialRepository =
            financialRepository;

        this.stockRepository =
            stockRepository;

        this.stockMovementRepository =
            stockMovementRepository;

        this.currentUserService =
            currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        LocalDate today =
            LocalDate.now();

        LocalDateTime startOfToday =
            today.atStartOfDay();

        LocalDateTime startOfTomorrow =
            today
                .plusDays(1)
                .atStartOfDay();

        LocalDate startOfMonth =
            today.withDayOfMonth(1);

        LocalDate endOfMonth =
            today.withDayOfMonth(
                today.lengthOfMonth()
            );

        long appointmentsToday =
            appointmentRepository
                .countAppointmentsInPeriod(
                    organizationId,
                    startOfToday,
                    startOfTomorrow
                );

        long activeClients =
            clientRepository
                .countByOrganizationIdAndActiveTrue(
                    organizationId
                );

        BigDecimal paidIncome =
            getFinancialTotal(
                organizationId,
                FinancialType.INCOME,
                FinancialStatus.PAID,
                startOfMonth,
                endOfMonth
            );

        BigDecimal paidExpense =
            getFinancialTotal(
                organizationId,
                FinancialType.EXPENSE,
                FinancialStatus.PAID,
                startOfMonth,
                endOfMonth
            );

        BigDecimal profit =
            paidIncome.subtract(
                paidExpense
            );

        long lowStockProducts =
            stockRepository
                .countLowStockProducts(
                    organizationId
                );

        List<RecentActivityResponse>
            recentActivities =
                getRecentActivities(
                    organizationId
                );

        return new DashboardResponse(
            appointmentsToday,
            activeClients,
            paidIncome,
            paidExpense,
            profit,
            lowStockProducts,
            recentActivities
        );
    }

    /*
     * =========================
     * ATIVIDADES RECENTES
     * =========================
     */

    private List<RecentActivityResponse>
        getRecentActivities(
            Long organizationId
        ) {

        Pageable pageable =
            PageRequest.of(
                0,
                ACTIVITIES_PER_SOURCE
            );

        List<RecentActivityResponse>
            activities =
                new ArrayList<>();

        addAppointmentActivities(
            organizationId,
            pageable,
            activities
        );

        addFinancialActivities(
            organizationId,
            pageable,
            activities
        );

        addStockActivities(
            organizationId,
            pageable,
            activities
        );

        return activities
            .stream()
            .sorted(
                Comparator.comparing(
                    RecentActivityResponse
                        ::getDateTime
                ).reversed()
            )
            .limit(
                MAX_RECENT_ACTIVITIES
            )
            .toList();
    }

    private void addAppointmentActivities(
            Long organizationId,
            Pageable pageable,
            List<RecentActivityResponse> activities
    ) {

        List<Appointment> appointments =
            appointmentRepository
                .findByOrganizationIdOrderByCreatedAtDesc(
                    organizationId,
                    pageable
                )
                .getContent();

        for (
            Appointment appointment
                : appointments
        ) {

            String description =
                "Agendamento #"
                + appointment.getId()
                + " para "
                + appointment.getStartTime()
                + " com status "
                + appointment.getStatus()
                + ".";

            activities.add(
                new RecentActivityResponse(
                    "APPOINTMENT",
                    "Novo agendamento",
                    description,
                    appointment.getCreatedAt()
                )
            );
        }
    }

    private void addFinancialActivities(
            Long organizationId,
            Pageable pageable,
            List<RecentActivityResponse> activities
    ) {

        List<FinancialTransaction>
            transactions =
                financialRepository
                    .findByOrganizationIdOrderByCreatedAtDesc(
                        organizationId,
                        pageable
                    )
                    .getContent();

        for (
            FinancialTransaction transaction
                : transactions
        ) {

            String title;

            if (
                transaction.getType()
                    == FinancialType.INCOME
            ) {

                title =
                    "Receita registrada";

            } else {

                title =
                    "Despesa registrada";
            }

            String description =
                transaction.getDescription()
                + " - R$ "
                + transaction
                    .getAmount()
                    .toPlainString()
                + ".";

            activities.add(
                new RecentActivityResponse(
                    "FINANCIAL",
                    title,
                    description,
                    transaction.getCreatedAt()
                )
            );
        }
    }

    private void addStockActivities(
            Long organizationId,
            Pageable pageable,
            List<RecentActivityResponse> activities
    ) {

        List<StockMovement> movements =
            stockMovementRepository
                .findByOrganizationIdOrderByCreatedAtDesc(
                    organizationId,
                    pageable
                )
                .getContent();

        for (
            StockMovement movement
                : movements
        ) {

            String title =
                getStockActivityTitle(
                    movement.getType()
                );

            String description =
                "Movimentação de "
                + movement.getQuantity()
                + " unidade(s). "
                + "Estoque: "
                + movement.getPreviousQuantity()
                + " → "
                + movement.getNewQuantity()
                + ".";

            if (
                movement.getReason() != null
                && !movement
                    .getReason()
                    .isBlank()
            ) {

                description +=
                    " Motivo: "
                    + movement.getReason()
                    + ".";
            }

            activities.add(
                new RecentActivityResponse(
                    "STOCK",
                    title,
                    description,
                    movement.getCreatedAt()
                )
            );
        }
    }

    private String getStockActivityTitle(
            StockMovementType type
    ) {

        return switch (type) {

            case ENTRY ->
                "Entrada de estoque";

            case EXIT ->
                "Saída de estoque";

            case ADJUSTMENT ->
                "Ajuste de estoque";
        };
    }

    /*
     * =========================
     * FINANCEIRO
     * =========================
     */

    private BigDecimal getFinancialTotal(
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
}