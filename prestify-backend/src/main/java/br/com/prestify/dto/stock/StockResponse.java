package br.com.prestify.dto.stock;

import java.time.LocalDateTime;

public class StockResponse {

    private Long id;

    private Long productId;
    private String productName;
    private String sku;

    private Integer quantity;
    private Integer minimumStock;

    private Boolean lowStock;
    private Boolean active;

    private LocalDateTime updatedAt;

    public StockResponse(
            Long id,
            Long productId,
            String productName,
            String sku,
            Integer quantity,
            Integer minimumStock,
            Boolean lowStock,
            Boolean active,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.quantity = quantity;
        this.minimumStock = minimumStock;
        this.lowStock = lowStock;
        this.active = active;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getSku() {
        return sku;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public Boolean getLowStock() {
        return lowStock;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}