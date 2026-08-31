package br.com.prestify.service;

import br.com.prestify.dto.platform.PlatformDashboardResponse;

import br.com.prestify.entity.Organization;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import br.com.prestify.repository.OrganizationRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformDashboardService {

    private final OrganizationRepository
        organizationRepository;

    private final UserRepository
        userRepository;

    public PlatformDashboardService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository
    ) {

        this.organizationRepository =
            organizationRepository;

        this.userRepository =
            userRepository;
    }

    @Transactional(readOnly = true)
    public PlatformDashboardResponse
        getDashboard() {

        long totalOrganizations =
            organizationRepository.count();

        long activeOrganizations =
            organizationRepository
                .countByActiveTrue();

        long inactiveOrganizations =
            organizationRepository
                .countByActiveFalse();

        long basicOrganizations =
            organizationRepository
                .countByPlan(
                    PlanType.BASIC
                );

        long proOrganizations =
            organizationRepository
                .countByPlan(
                    PlanType.PRO
                );

        long premiumOrganizations =
            organizationRepository
                .countByPlan(
                    PlanType.PREMIUM
                );

        long activeSubscriptions =
            organizationRepository
                .countByActiveTrueAndSubscriptionStatus(
                    SubscriptionStatus.ACTIVE
                );

        long activeUsers =
            userRepository
                .countByActiveTrueAndOrganizationIsNotNull();

        BigDecimal
            estimatedMonthlyRevenue =
                calculateEstimatedMonthlyRevenue();

        return new PlatformDashboardResponse(
            totalOrganizations,
            activeOrganizations,
            inactiveOrganizations,
            basicOrganizations,
            proOrganizations,
            premiumOrganizations,
            activeSubscriptions,
            activeUsers,
            estimatedMonthlyRevenue
        );
    }

    private BigDecimal
        calculateEstimatedMonthlyRevenue() {

        List<Organization>
            organizations =
                organizationRepository
                    .findByActiveTrueAndSubscriptionStatus(
                        SubscriptionStatus.ACTIVE
                    );

        BigDecimal total =
            BigDecimal.ZERO;

        for (
            Organization organization :
            organizations
        ) {

            BigDecimal monthlyPrice =
                PlanRules
                    .getMonthlyPrice(
                        organization
                            .getPlan()
                    );

            if (
                organization
                    .getBillingCycle()
                    == BillingCycle.YEARLY
            ) {

                BigDecimal annualPrice =
                    monthlyPrice
                        .multiply(
                            BigDecimal.TEN
                        );

                BigDecimal
                    monthlyEquivalent =
                        annualPrice
                            .divide(
                                BigDecimal
                                    .valueOf(12),
                                2,
                                RoundingMode.HALF_UP
                            );

                total =
                    total.add(
                        monthlyEquivalent
                    );

            } else {

                total =
                    total.add(
                        monthlyPrice
                    );
            }
        }

        return total.setScale(
            2,
            RoundingMode.HALF_UP
        );
    }
}