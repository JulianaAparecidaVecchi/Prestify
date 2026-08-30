package br.com.prestify.service;

import br.com.prestify.dto.report.FinancialSeriesResponse;
import br.com.prestify.dto.report.ReportSummaryResponse;

import br.com.prestify.entity.FinancialTransaction;

import br.com.prestify.enums.AppointmentStatus;
import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;

import br.com.prestify.exception.BusinessException;

import br.com.prestify.repository.AppointmentRepository;
import br.com.prestify.repository.ClientRepository;
import br.com.prestify.repository.FinancialRepository;
import br.com.prestify.repository.StockRepository;

import br.com.prestify.security.CurrentUserService;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final FinancialRepository financialRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final StockRepository stockRepository;
    private final CurrentUserService currentUserService;

    public ReportService(
            FinancialRepository financialRepository,
            AppointmentRepository appointmentRepository,
            ClientRepository clientRepository,
            StockRepository stockRepository,
            CurrentUserService currentUserService
    ) {
        this.financialRepository = financialRepository;
        this.appointmentRepository = appointmentRepository;
        this.clientRepository = clientRepository;
        this.stockRepository = stockRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummary(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validatePeriod(startDate, endDate);

        Long organizationId =
            currentUserService.getOrganizationId();

        BigDecimal paidIncome =
            getFinancialTotal(
                organizationId,
                FinancialType.INCOME,
                FinancialStatus.PAID,
                startDate,
                endDate
            );

        BigDecimal paidExpense =
            getFinancialTotal(
                organizationId,
                FinancialType.EXPENSE,
                FinancialStatus.PAID,
                startDate,
                endDate
            );

        BigDecimal receivable =
            getFinancialTotal(
                organizationId,
                FinancialType.INCOME,
                FinancialStatus.PENDING,
                startDate,
                endDate
            );

        BigDecimal payable =
            getFinancialTotal(
                organizationId,
                FinancialType.EXPENSE,
                FinancialStatus.PENDING,
                startDate,
                endDate
            );

        BigDecimal profit =
            paidIncome.subtract(paidExpense);

        var start =
            startDate.atStartOfDay();

        var endExclusive =
            endDate
                .plusDays(1)
                .atStartOfDay();

        long appointments =
            appointmentRepository
                .countAllAppointmentsInPeriod(
                    organizationId,
                    start,
                    endExclusive
                );

        long completedAppointments =
            appointmentRepository
                .countAppointmentsByStatusInPeriod(
                    organizationId,
                    start,
                    endExclusive,
                    AppointmentStatus.COMPLETED
                );

        long cancelledAppointments =
            appointmentRepository
                .countAppointmentsByStatusInPeriod(
                    organizationId,
                    start,
                    endExclusive,
                    AppointmentStatus.CANCELLED
                );

        long noShowAppointments =
            appointmentRepository
                .countAppointmentsByStatusInPeriod(
                    organizationId,
                    start,
                    endExclusive,
                    AppointmentStatus.NO_SHOW
                );

        long activeClients =
            clientRepository
                .countByOrganizationIdAndActiveTrue(
                    organizationId
                );

        long lowStockProducts =
            stockRepository
                .countLowStockProducts(
                    organizationId
                );

        return new ReportSummaryResponse(
            startDate,
            endDate,
            paidIncome,
            paidExpense,
            profit,
            receivable,
            payable,
            appointments,
            completedAppointments,
            cancelledAppointments,
            noShowAppointments,
            activeClients,
            lowStockProducts
        );
    }

    @Transactional(readOnly = true)
    public List<FinancialSeriesResponse>
        getFinancialSeries(
            LocalDate startDate,
            LocalDate endDate
        ) {

        validatePeriod(startDate, endDate);

        Long organizationId =
            currentUserService.getOrganizationId();

        List<FinancialTransaction> transactions =
            financialRepository.findPaidInPeriod(
                organizationId,
                startDate,
                endDate
            );

        Map<LocalDate, BigDecimal> incomeByDate =
            new LinkedHashMap<>();

        Map<LocalDate, BigDecimal> expenseByDate =
            new LinkedHashMap<>();

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            incomeByDate.put(
                currentDate,
                BigDecimal.ZERO
            );

            expenseByDate.put(
                currentDate,
                BigDecimal.ZERO
            );

            currentDate =
                currentDate.plusDays(1);
        }

        for (
            FinancialTransaction transaction
            : transactions
        ) {

            LocalDate date =
                transaction.getDueDate();

            if (
                transaction.getType()
                    == FinancialType.INCOME
            ) {

                incomeByDate.put(
                    date,
                    incomeByDate
                        .get(date)
                        .add(
                            transaction.getAmount()
                        )
                );

            } else if (
                transaction.getType()
                    == FinancialType.EXPENSE
            ) {

                expenseByDate.put(
                    date,
                    expenseByDate
                        .get(date)
                        .add(
                            transaction.getAmount()
                        )
                );
            }
        }

        List<FinancialSeriesResponse> result =
            new ArrayList<>();

        currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            result.add(
                new FinancialSeriesResponse(
                    currentDate,
                    incomeByDate.get(currentDate),
                    expenseByDate.get(currentDate)
                )
            );

            currentDate =
                currentDate.plusDays(1);
        }

        return result;
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

    private void validatePeriod(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (
            startDate == null
            || endDate == null
        ) {
            throw new BusinessException(
                "A data inicial e a data final são obrigatórias."
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new BusinessException(
                "A data inicial não pode ser posterior à data final."
            );
        }

        if (
            startDate
                .plusYears(2)
                .isBefore(endDate)
        ) {
            throw new BusinessException(
                "O período máximo permitido para o relatório é de 2 anos."
            );
        }
    }
}