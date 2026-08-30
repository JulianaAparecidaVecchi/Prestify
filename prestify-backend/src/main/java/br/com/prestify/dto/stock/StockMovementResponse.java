package br.com.prestify.dto.stock;

import java.time.LocalDateTime;

public class StockMovementResponse {

    private Long id;

    private Long productId;
    private String productName;

    private String type;

    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;

    private String reason;

    private Long userId;
    private String userName;

    private LocalDateTime createdAt;

    public StockMovementResponse(
            Long id,
            Long productId,
            String productName,
            String type,
            Integer quantity,
            Integer previousQuantity,
            Integer newQuantity,
            String reason,
            Long userId,
            String userName,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.type = type;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.reason = reason;
        this.userId = userId;
        this.userName = userName;
        this.createdAt = createdAt;
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

    public String getType() {
        return type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public String getReason() {
        return reason;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}