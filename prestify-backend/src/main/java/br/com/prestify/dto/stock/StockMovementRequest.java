package br.com.prestify.dto.stock;

import br.com.prestify.enums.StockMovementType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class StockMovementRequest {

    @NotNull(
        message = "O produto é obrigatório."
    )
    private Long productId;

    @NotNull(
        message = "O tipo da movimentação é obrigatório."
    )
    private StockMovementType type;

    @NotNull(
        message = "A quantidade é obrigatória."
    )
    @Positive(
        message = "A quantidade deve ser maior que zero."
    )
    private Integer quantity;

    @Size(
        max = 500,
        message = "O motivo deve possuir no máximo 500 caracteres."
    )
    private String reason;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(
            Long productId
    ) {
        this.productId = productId;
    }

    public StockMovementType getType() {
        return type;
    }

    public void setType(
            StockMovementType type
    ) {
        this.type = type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(
            Integer quantity
    ) {
        this.quantity = quantity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }
}