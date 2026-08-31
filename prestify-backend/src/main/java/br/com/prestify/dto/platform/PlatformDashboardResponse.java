package br.com.prestify.dto.platform;

import java.math.BigDecimal;

public class PlatformDashboardResponse {

    private final long totalOrganizations;

    private final long activeOrganizations;

    private final long inactiveOrganizations;

    private final long basicOrganizations;

    private final long proOrganizations;

    private final long premiumOrganizations;

    private final long activeSubscriptions;

    private final long activeUsers;

    private final BigDecimal
        estimatedMonthlyRevenue;

    public PlatformDashboardResponse(
            long totalOrganizations,
            long activeOrganizations,
            long inactiveOrganizations,
            long basicOrganizations,
            long proOrganizations,
            long premiumOrganizations,
            long activeSubscriptions,
            long activeUsers,
            BigDecimal estimatedMonthlyRevenue
    ) {

        this.totalOrganizations =
            totalOrganizations;

        this.activeOrganizations =
            activeOrganizations;

        this.inactiveOrganizations =
            inactiveOrganizations;

        this.basicOrganizations =
            basicOrganizations;

        this.proOrganizations =
            proOrganizations;

        this.premiumOrganizations =
            premiumOrganizations;

        this.activeSubscriptions =
            activeSubscriptions;

        this.activeUsers =
            activeUsers;

        this.estimatedMonthlyRevenue =
            estimatedMonthlyRevenue;
    }

    public long getTotalOrganizations() {

        return totalOrganizations;
    }

    public long getActiveOrganizations() {

        return activeOrganizations;
    }

    public long getInactiveOrganizations() {

        return inactiveOrganizations;
    }

    public long getBasicOrganizations() {

        return basicOrganizations;
    }

    public long getProOrganizations() {

        return proOrganizations;
    }

    public long getPremiumOrganizations() {

        return premiumOrganizations;
    }

    public long getActiveSubscriptions() {

        return activeSubscriptions;
    }

    public long getActiveUsers() {

        return activeUsers;
    }

    public BigDecimal
        getEstimatedMonthlyRevenue() {

        return estimatedMonthlyRevenue;
    }
}