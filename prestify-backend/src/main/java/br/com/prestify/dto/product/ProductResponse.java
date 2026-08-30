package br.com.prestify.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String description;

    private BigDecimal salePrice;
    private BigDecimal costPrice;

    private String unit;
    private Integer minimumStock;

    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse(
            Long id,
            String name,
            String sku,
            String description,
            BigDecimal salePrice,
            BigDecimal costPrice,
            String unit,
            Integer minimumStock,
            Boolean active,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.salePrice = salePrice;
        this.costPrice = costPrice;
        this.unit = unit;
        this.minimumStock = minimumStock;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}