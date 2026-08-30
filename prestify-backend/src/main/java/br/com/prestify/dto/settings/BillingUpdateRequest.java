package br.com.prestify.dto.settings;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;

import jakarta.validation.constraints.NotNull;

public class BillingUpdateRequest {

    @NotNull(
        message =
            "O plano é obrigatório."
    )
    private PlanType plan;

    @NotNull(
        message =
            "O ciclo de cobrança é obrigatório."
    )
    private BillingCycle billingCycle;

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
}