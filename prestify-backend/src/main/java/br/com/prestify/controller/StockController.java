package br.com.prestify.controller;

import br.com.prestify.dto.stock.StockMovementRequest;
import br.com.prestify.dto.stock.StockMovementResponse;
import br.com.prestify.dto.stock.StockMovementResult;
import br.com.prestify.dto.stock.StockResponse;

import br.com.prestify.enums.StockMovementType;

import br.com.prestify.service.StockService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(
            StockService stockService
    ) {
        this.stockService =
            stockService;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<StockResponse> list(

            @RequestParam(
                required = false
            )
            String search,

            @RequestParam(
                required = false
            )
            Boolean active,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "20"
            )
            int size

    ) {

        return stockService.list(
            search,
            active,
            page,
            size
        );
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public StockResponse getByProductId(
            @PathVariable Long productId
    ) {

        return stockService
            .getByProductId(productId);
    }

    @PostMapping("/movements")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public StockMovementResult move(
            @Valid
            @RequestBody
            StockMovementRequest request
    ) {

        return stockService.move(request);
    }

    @GetMapping("/movements")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<StockMovementResponse> listMovements(

            @RequestParam(
                required = false
            )
            Long productId,

            @RequestParam(
                required = false
            )
            StockMovementType type,

            @RequestParam(
                required = false
            )
            LocalDateTime start,

            @RequestParam(
                required = false
            )
            LocalDateTime end,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "20"
            )
            int size

    ) {

        return stockService.listMovements(
            productId,
            type,
            start,
            end,
            page,
            size
        );
    }
}