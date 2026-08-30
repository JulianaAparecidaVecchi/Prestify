package br.com.prestify.dto.settings;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BillingResponse {

    private final PlanType plan;

    private final BillingCycle billingCycle;

    private final SubscriptionStatus
        subscriptionStatus;

    private final LocalDate
        subscriptionStartDate;

    private final LocalDate
        nextBillingDate;

    private final BigDecimal price;

    public BillingResponse(
            PlanType plan,
            BillingCycle billingCycle,
            SubscriptionStatus subscriptionStatus,
            LocalDate subscriptionStartDate,
            LocalDate nextBillingDate,
            BigDecimal price
    ) {

        this.plan = plan;

        this.billingCycle =
            billingCycle;

        this.subscriptionStatus =
            subscriptionStatus;

        this.subscriptionStartDate =
            subscriptionStartDate;

        this.nextBillingDate =
            nextBillingDate;

        this.price =
            price;
    }

    public PlanType getPlan() {
        return plan;
    }

    public BillingCycle
        getBillingCycle() {

        return billingCycle;
    }

    public SubscriptionStatus
        getSubscriptionStatus() {

        return subscriptionStatus;
    }

    public LocalDate
        getSubscriptionStartDate() {

        return subscriptionStartDate;
    }

    public LocalDate
        getNextBillingDate() {

        return nextBillingDate;
    }

    public BigDecimal getPrice() {
        return price;
    }
}