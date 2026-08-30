package br.com.prestify.service;

import br.com.prestify.dto.dashboard.DashboardResponse;

import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;

import br.com.prestify.repository.AppointmentRepository;
import br.com.prestify.repository.ClientRepository;
import br.com.prestify.repository.FinancialRepository;
import br.com.prestify.repository.StockRepository;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final FinancialRepository financialRepository;
    private final StockRepository stockRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(
            AppointmentRepository appointmentRepository,
            ClientRepository clientRepository,
            FinancialRepository financialRepository,
            StockRepository stockRepository,
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

        this.currentUserService =
            currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        Long organizationId =
            currentUserService.getOrganizationId();

        LocalDate today =
            LocalDate.now();

        LocalDateTime startOfToday =
            today.atStartOfDay();

        LocalDateTime startOfTomorrow =
            today.plusDays(1).atStartOfDay();

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

        return new DashboardResponse(
            appointmentsToday,
            activeClients,
            paidIncome,
            paidExpense,
            profit,
            lowStockProducts
        );
    }

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