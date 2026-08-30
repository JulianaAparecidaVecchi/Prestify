package br.com.prestify.dto.dashboard;

import java.math.BigDecimal;

public class DashboardResponse {

    private final long appointmentsToday;
    private final long activeClients;
    private final BigDecimal paidIncome;
    private final BigDecimal paidExpense;
    private final BigDecimal profit;
    private final long lowStockProducts;

    public DashboardResponse(
            long appointmentsToday,
            long activeClients,
            BigDecimal paidIncome,
            BigDecimal paidExpense,
            BigDecimal profit,
            long lowStockProducts
    ) {
        this.appointmentsToday = appointmentsToday;
        this.activeClients = activeClients;
        this.paidIncome = paidIncome;
        this.paidExpense = paidExpense;
        this.profit = profit;
        this.lowStockProducts = lowStockProducts;
    }

    public long getAppointmentsToday() {
        return appointmentsToday;
    }

    public long getActiveClients() {
        return activeClients;
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

    public long getLowStockProducts() {
        return lowStockProducts;
    }
}