package br.com.prestify.dto.stock;

public class StockMovementResult {

    private StockResponse stock;
    private StockMovementResponse movement;

    public StockMovementResult(
            StockResponse stock,
            StockMovementResponse movement
    ) {
        this.stock = stock;
        this.movement = movement;
    }

    public StockResponse getStock() {
        return stock;
    }

    public StockMovementResponse getMovement() {
        return movement;
    }
}