package br.com.prestify.dto.platform;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;
import br.com.prestify.enums.SystemModule;

import java.time.LocalDate;
import java.util.Set;

public class PlatformOrganizationResponse {

    private Long id;

    private String name;

    private String document;

    private String email;

    private String phone;

    private String address;

    private Boolean active;

    private PlanType plan;

    private BillingCycle billingCycle;

    private SubscriptionStatus
        subscriptionStatus;

    private LocalDate
        subscriptionStartDate;

    private LocalDate
        nextBillingDate;

    private Set<SystemModule>
        enabledModules;

    private Long activeUsers;

    private Long ownerId;

    private String ownerName;

    private String ownerEmail;

    public PlatformOrganizationResponse() {
    }

    public PlatformOrganizationResponse(
            Long id,
            String name,
            String document,
            String email,
            String phone,
            String address,
            Boolean active,
            PlanType plan,
            BillingCycle billingCycle,
            SubscriptionStatus subscriptionStatus,
            LocalDate subscriptionStartDate,
            LocalDate nextBillingDate,
            Set<SystemModule> enabledModules,
            Long activeUsers,
            Long ownerId,
            String ownerName,
            String ownerEmail
    ) {
        this.id = id;
        this.name = name;
        this.document = document;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.active = active;
        this.plan = plan;
        this.billingCycle = billingCycle;
        this.subscriptionStatus =
            subscriptionStatus;
        this.subscriptionStartDate =
            subscriptionStartDate;
        this.nextBillingDate =
            nextBillingDate;
        this.enabledModules =
            enabledModules;
        this.activeUsers =
            activeUsers;
        this.ownerId =
            ownerId;
        this.ownerName =
            ownerName;
        this.ownerEmail =
            ownerEmail;
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(
            String document
    ) {
        this.document = document;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(
            String phone
    ) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(
            String address
    ) {
        this.address = address;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }

    public PlanType getPlan() {
        return plan;
    }

    public void setPlan(
            PlanType plan
    ) {
        this.plan = plan;
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

    public Set<SystemModule>
        getEnabledModules() {

        return enabledModules;
    }

    public void setEnabledModules(
            Set<SystemModule> enabledModules
    ) {
        this.enabledModules =
            enabledModules;
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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(
            Long ownerId
    ) {
        this.ownerId =
            ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(
            String ownerName
    ) {
        this.ownerName =
            ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(
            String ownerEmail
    ) {
        this.ownerEmail =
            ownerEmail;
    }
}