package br.com.prestify.dto.financial;

import br.com.prestify.enums.FinancialType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialCreateRequest {

    @NotBlank(
        message = "A descrição é obrigatória."
    )
    @Size(
        max = 180,
        message = "A descrição deve possuir no máximo 180 caracteres."
    )
    private String description;

    @NotNull(
        message = "O tipo é obrigatório."
    )
    private FinancialType type;

    @NotNull(
        message = "O valor é obrigatório."
    )
    @DecimalMin(
        value = "0.01",
        message = "O valor deve ser maior que zero."
    )
    private BigDecimal amount;

    @Size(
        max = 100,
        message = "A categoria deve possuir no máximo 100 caracteres."
    )
    private String category;

    @NotNull(
        message = "A data de vencimento é obrigatória."
    )
    private LocalDate dueDate;

    private Long supplierId;
    private Long clientId;

    @Size(
        max = 2000,
        message = "As observações devem possuir no máximo 2000 caracteres."
    )
    private String notes;

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public FinancialType getType() {
        return type;
    }

    public void setType(
            FinancialType type
    ) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category
    ) {
        this.category = category;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(
            LocalDate dueDate
    ) {
        this.dueDate = dueDate;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(
            Long supplierId
    ) {
        this.supplierId = supplierId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(
            Long clientId
    ) {
        this.clientId = clientId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }
}