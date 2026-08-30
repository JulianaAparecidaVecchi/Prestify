package br.com.prestify.dto.product;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class ProductUpdateRequest {

    @NotBlank(
        message = "O nome é obrigatório."
    )
    @Size(max = 150)
    private String name;

    @NotBlank(
        message = "O SKU é obrigatório."
    )
    @Size(max = 50)
    private String sku;

    @Size(max = 2000)
    private String description;

    @NotNull(
        message = "O preço de venda é obrigatório."
    )
    @DecimalMin(
        value = "0.00",
        message = "O preço de venda não pode ser negativo."
    )
    private BigDecimal salePrice;

    @NotNull(
        message = "O preço de custo é obrigatório."
    )
    @DecimalMin(
        value = "0.00",
        message = "O preço de custo não pode ser negativo."
    )
    private BigDecimal costPrice;

    @NotBlank(
        message = "A unidade é obrigatória."
    )
    @Size(max = 30)
    private String unit;

    @NotNull(
        message = "O estoque mínimo é obrigatório."
    )
    @Min(
        value = 0,
        message = "O estoque mínimo não pode ser negativo."
    )
    private Integer minimumStock;

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(
            String sku
    ) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(
            BigDecimal salePrice
    ) {
        this.salePrice = salePrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(
            BigDecimal costPrice
    ) {
        this.costPrice = costPrice;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(
            String unit
    ) {
        this.unit = unit;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(
            Integer minimumStock
    ) {
        this.minimumStock = minimumStock;
    }
}