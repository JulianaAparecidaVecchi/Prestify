package br.com.prestify.dto.financial;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FinancialResponse {

    private Long id;

    private String description;
    private String type;
    private BigDecimal amount;
    private String category;

    private String status;
    private String paymentMethod;

    private LocalDate dueDate;
    private LocalDate paymentDate;

    private Long supplierId;
    private String supplierName;

    private Long clientId;
    private String clientName;

    private String notes;

    private Long createdByUserId;
    private String createdByUserName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FinancialResponse(
            Long id,
            String description,
            String type,
            BigDecimal amount,
            String category,
            String status,
            String paymentMethod,
            LocalDate dueDate,
            LocalDate paymentDate,
            Long supplierId,
            String supplierName,
            Long clientId,
            String clientName,
            String notes,
            Long createdByUserId,
            String createdByUserName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.dueDate = dueDate;
        this.paymentDate = paymentDate;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.clientId = clientId;
        this.clientName = clientName;
        this.notes = notes;
        this.createdByUserId = createdByUserId;
        this.createdByUserName = createdByUserName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public Long getClientId() {
        return clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public String getNotes() {
        return notes;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public String getCreatedByUserName() {
        return createdByUserName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}