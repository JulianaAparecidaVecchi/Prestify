package br.com.prestify.dto.platform;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import java.math.BigDecimal;

import java.time.LocalDate;

public class PlatformSubscriptionResponse {

    private Long organizationId;

    private String organizationName;

    private String document;

    private String email;

    private Boolean organizationActive;

    private PlanType plan;

    private BillingCycle billingCycle;

    private SubscriptionStatus
        subscriptionStatus;

    private LocalDate
        subscriptionStartDate;

    private LocalDate
        nextBillingDate;

    private BigDecimal price;

    private BigDecimal
        monthlyEquivalent;

    private Long activeUsers;

    public PlatformSubscriptionResponse() {
    }

    public PlatformSubscriptionResponse(
            Long organizationId,
            String organizationName,
            String document,
            String email,
            Boolean organizationActive,
            PlanType plan,
            BillingCycle billingCycle,
            SubscriptionStatus subscriptionStatus,
            LocalDate subscriptionStartDate,
            LocalDate nextBillingDate,
            BigDecimal price,
            BigDecimal monthlyEquivalent,
            Long activeUsers
    ) {

        this.organizationId =
            organizationId;

        this.organizationName =
            organizationName;

        this.document =
            document;

        this.email =
            email;

        this.organizationActive =
            organizationActive;

        this.plan =
            plan;

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

        this.monthlyEquivalent =
            monthlyEquivalent;

        this.activeUsers =
            activeUsers;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(
            Long organizationId
    ) {
        this.organizationId =
            organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(
            String organizationName
    ) {
        this.organizationName =
            organizationName;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(
            String document
    ) {
        this.document =
            document;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email =
            email;
    }

    public Boolean
        getOrganizationActive() {

        return organizationActive;
    }

    public void setOrganizationActive(
            Boolean organizationActive
    ) {
        this.organizationActive =
            organizationActive;
    }

    public PlanType getPlan() {
        return plan;
    }

    public void setPlan(
            PlanType plan
    ) {
        this.plan =
            plan;
    }

    public BillingCycle
        getBillingCycle() {

        return billingCycle;
    }

    public void setBillingCycle(
            BillingCycle billingCycle
    ) {
        this.billingCycle =
            billingCycle;
    }

    public SubscriptionStatus
        getSubscriptionStatus() {

        return subscriptionStatus;
    }

    public void setSubscriptionStatus(
            SubscriptionStatus subscriptionStatus
    ) {
        this.subscriptionStatus =
            subscriptionStatus;
    }

    public LocalDate
        getSubscriptionStartDate() {

        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(
            LocalDate subscriptionStartDate
    ) {
        this.subscriptionStartDate =
            subscriptionStartDate;
    }

    public LocalDate
        getNextBillingDate() {

        return nextBillingDate;
    }

    public void setNextBillingDate(
            LocalDate nextBillingDate
    ) {
        this.nextBillingDate =
            nextBillingDate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(
            BigDecimal price
    ) {
        this.price =
            price;
    }

    public BigDecimal
        getMonthlyEquivalent() {

        return monthlyEquivalent;
    }

    public void setMonthlyEquivalent(
            BigDecimal monthlyEquivalent
    ) {
        this.monthlyEquivalent =
            monthlyEquivalent;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(
            Long activeUsers
    ) {
        this.activeUsers =
            activeUsers;
    }
}