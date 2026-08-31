package br.com.prestify.service;

import br.com.prestify.dto.platform.PlatformSubscriptionResponse;

import br.com.prestify.entity.Organization;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import br.com.prestify.repository.OrganizationRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformSubscriptionService {

    private final OrganizationRepository
        organizationRepository;

    private final UserRepository
        userRepository;

    public PlatformSubscriptionService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository
    ) {

        this.organizationRepository =
            organizationRepository;

        this.userRepository =
            userRepository;
    }

    @Transactional(readOnly = true)
    public Page<PlatformSubscriptionResponse>
        list(
            String search,
            PlanType plan,
            BillingCycle billingCycle,
            SubscriptionStatus subscriptionStatus,
            Boolean active,
            int page,
            int size
        ) {

        String normalizedSearch =
            search == null
                ? ""
                : search.trim();

        int normalizedPage =
            Math.max(
                page,
                0
            );

        int normalizedSize =
            Math.min(
                Math.max(
                    size,
                    1
                ),
                100
            );

        Pageable pageable =
            PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(
                    Sort.Order.asc(
                        "nextBillingDate"
                    ),
                    Sort.Order.asc(
                        "name"
                    )
                )
            );

        return organizationRepository
            .searchSubscriptions(
                normalizedSearch,
                plan,
                billingCycle,
                subscriptionStatus,
                active,
                pageable
            )
            .map(
                this::toResponse
            );
    }

    private PlatformSubscriptionResponse
        toResponse(
            Organization organization
        ) {

        BigDecimal monthlyPrice =
            PlanRules.getMonthlyPrice(
                organization.getPlan()
            );

        BigDecimal price;

        BigDecimal monthlyEquivalent;

        if (
            organization
                .getBillingCycle()
                == BillingCycle.YEARLY
        ) {

            price =
                monthlyPrice
                    .multiply(
                        BigDecimal.TEN
                    )
                    .setScale(
                        2,
                        RoundingMode.HALF_UP
                    );

            monthlyEquivalent =
                price.divide(
                    BigDecimal.valueOf(
                        12
                    ),
                    2,
                    RoundingMode.HALF_UP
                );

        } else {

            price =
                monthlyPrice.setScale(
                    2,
                    RoundingMode.HALF_UP
                );

            monthlyEquivalent =
                monthlyPrice.setScale(
                    2,
                    RoundingMode.HALF_UP
                );
        }

        long activeUsers =
            userRepository
                .countByOrganizationIdAndActiveTrue(
                    organization.getId()
                );

        return new PlatformSubscriptionResponse(
            organization.getId(),
            organization.getName(),
            organization.getDocument(),
            organization.getEmail(),
            organization.getActive(),
            organization.getPlan(),
            organization.getBillingCycle(),
            organization.getSubscriptionStatus(),
            organization.getSubscriptionStartDate(),
            organization.getNextBillingDate(),
            price,
            monthlyEquivalent,
            activeUsers
        );
    }
}