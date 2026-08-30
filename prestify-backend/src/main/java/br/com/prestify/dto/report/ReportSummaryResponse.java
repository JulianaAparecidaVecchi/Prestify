package br.com.prestify.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReportSummaryResponse {

    private final LocalDate startDate;
    private final LocalDate endDate;

    private final BigDecimal paidIncome;
    private final BigDecimal paidExpense;
    private final BigDecimal profit;

    private final BigDecimal receivable;
    private final BigDecimal payable;

    private final long appointments;
    private final long completedAppointments;
    private final long cancelledAppointments;
    private final long noShowAppointments;

    private final long activeClients;
    private final long lowStockProducts;

    public ReportSummaryResponse(
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal paidIncome,
            BigDecimal paidExpense,
            BigDecimal profit,
            BigDecimal receivable,
            BigDecimal payable,
            long appointments,
            long completedAppointments,
            long cancelledAppointments,
            long noShowAppointments,
            long activeClients,
            long lowStockProducts
    ) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.paidIncome = paidIncome;
        this.paidExpense = paidExpense;
        this.profit = profit;
        this.receivable = receivable;
        this.payable = payable;
        this.appointments = appointments;
        this.completedAppointments = completedAppointments;
        this.cancelledAppointments = cancelledAppointments;
        this.noShowAppointments = noShowAppointments;
        this.activeClients = activeClients;
        this.lowStockProducts = lowStockProducts;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public BigDecimal getPaidIncome() {
        return paidIncome;
    }

    public BigDecimal getPaidExpense() {
        return paidExpense;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public BigDecimal getReceivable() {
        return receivable;
    }

    public BigDecimal getPayable() {
        return payable;
    }

    public long getAppointments() {
        return appointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public long getNoShowAppointments() {
        return noShowAppointments;
    }

    public long getActiveClients() {
        return activeClients;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }
}