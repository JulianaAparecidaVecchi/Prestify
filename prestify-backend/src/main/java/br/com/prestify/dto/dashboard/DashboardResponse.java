package br.com.prestify.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private final long appointmentsToday;
    private final long activeClients;
    private final BigDecimal paidIncome;
    private final BigDecimal paidExpense;
    private final BigDecimal profit;
    private final long lowStockProducts;

    private final List<RecentActivityResponse>
        recentActivities;

    public DashboardResponse(
            long appointmentsToday,
            long activeClients,
            BigDecimal paidIncome,
            BigDecimal paidExpense,
            BigDecimal profit,
            long lowStockProducts,
            List<RecentActivityResponse> recentActivities
    ) {
        this.appointmentsToday =
            appointmentsToday;

        this.activeClients =
            activeClients;

        this.paidIncome =
            paidIncome;

        this.paidExpense =
            paidExpense;

        this.profit =
            profit;

        this.lowStockProducts =
            lowStockProducts;

        this.recentActivities =
            recentActivities;
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

    public List<RecentActivityResponse>
        getRecentActivities() {

        return recentActivities;
    }
}