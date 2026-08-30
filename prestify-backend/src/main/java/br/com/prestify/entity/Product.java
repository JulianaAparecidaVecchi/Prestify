package br.com.prestify.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "products",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_product_organization_sku",
            columnNames = {
                "organization_id",
                "sku"
            }
        )
    },
    indexes = {
        @Index(
            name = "idx_product_organization",
            columnList = "organization_id"
        ),
        @Index(
            name = "idx_product_name",
            columnList = "name"
        ),
        @Index(
            name = "idx_product_sku",
            columnList = "sku"
        )
    }
)
public class Product {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        nullable = false,
        length = 150
    )
    private String name;

    @Column(
        nullable = false,
        length = 50
    )
    private String sku;

    @Column(
        columnDefinition = "TEXT"
    )
    private String description;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal salePrice;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal costPrice;

    @Column(
        nullable = false,
        length = 30
    )
    private String unit;

    @Column(
        nullable = false
    )
    private Integer minimumStock;

    @Column(
        nullable = false
    )
    private Boolean active = true;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "organization_id",
        nullable = false
    )
    private Organization organization;

    @Column(
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
            LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(
            Organization organization
    ) {
        this.organization = organization;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}