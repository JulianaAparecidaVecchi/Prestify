package br.com.prestify.dto.financial;

import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class FinancialStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
    )
    private FinancialStatus status;

    private PaymentMethod paymentMethod;
    private LocalDate paymentDate;

    public FinancialStatus getStatus() {
        return status;
    }

    public void setStatus(
            FinancialStatus status
    ) {
        this.status = status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(
            PaymentMethod paymentMethod
    ) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(
            LocalDate paymentDate
    ) {
        this.paymentDate = paymentDate;
    }
}