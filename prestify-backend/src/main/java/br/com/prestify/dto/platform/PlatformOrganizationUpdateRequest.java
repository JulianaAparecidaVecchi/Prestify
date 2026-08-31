package br.com.prestify.dto.platform;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PlatformOrganizationUpdateRequest {

    @NotBlank(
        message =
            "Informe o nome da empresa."
    )
    @Size(
        max = 150
    )
    private String name;

    @Size(
        max = 30
    )
    private String document;

    @Email(
        message =
            "Informe um e-mail válido."
    )
    @Size(
        max = 150
    )
    private String email;

    @Size(
        max = 30
    )
    private String phone;

    @Size(
        max = 250
    )
    private String address;

    @NotNull(
        message =
            "Informe o plano."
    )
    private PlanType plan;

    @NotNull(
        message =
            "Informe o ciclo de cobrança."
    )
    private BillingCycle billingCycle;

    @NotNull(
        message =
            "Informe o status da assinatura."
    )
    private SubscriptionStatus
        subscriptionStatus;

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
}