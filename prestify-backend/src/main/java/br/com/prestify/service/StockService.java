package br.com.prestify.service;

import br.com.prestify.dto.stock.StockMovementRequest;
import br.com.prestify.dto.stock.StockMovementResponse;
import br.com.prestify.dto.stock.StockMovementResult;
import br.com.prestify.dto.stock.StockResponse;

import br.com.prestify.entity.Product;
import br.com.prestify.entity.Stock;
import br.com.prestify.entity.StockMovement;
import br.com.prestify.entity.User;

import br.com.prestify.enums.StockMovementType;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.ProductRepository;
import br.com.prestify.repository.StockMovementRepository;
import br.com.prestify.repository.StockRepository;

import br.com.prestify.security.CurrentUserService;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public StockService(
            StockRepository stockRepository,
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository,
            CurrentUserService currentUserService
    ) {
        this.stockRepository = stockRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    public Page<StockResponse> list(
            String search,
            Boolean active,
            int page,
            int size
    ) {

        validatePagination(page, size);

        Long organizationId =
            currentUserService.getOrganizationId();

        String normalizedSearch =
            normalizeNullable(search);

        return stockRepository
            .search(
                organizationId,
                normalizedSearch,
                active,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.ASC,
                        "product.name"
                    )
                )
            )
            .map(this::toStockResponse);
    }

    public StockResponse getByProductId(
            Long productId
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Product product =
            findProduct(
                productId,
                organizationId
            );

        Stock stock =
            stockRepository
                .findByProductIdAndOrganizationId(
                    productId,
                    organizationId
                )
                .orElseGet(
                    () -> createInitialStock(product)
                );

        return toStockResponse(stock);
    }

    @Transactional
    public StockMovementResult move(
            StockMovementRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        Product product =
            findProduct(
                request.getProductId(),
                organizationId
            );

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException(
                "Não é possível movimentar o estoque de um produto inativo."
            );
        }

        Stock stock =
            stockRepository
                .findByProductIdAndOrganizationId(
                    product.getId(),
                    organizationId
                )
                .orElseGet(
                    () -> createInitialStock(product)
                );

        Integer previousQuantity =
            stock.getQuantity();

        Integer newQuantity =
            calculateNewQuantity(
                previousQuantity,
                request.getQuantity(),
                request.getType()
            );

        StockMovement movement =
            new StockMovement();

        movement.setProduct(product);
        movement.setType(request.getType());
        movement.setQuantity(
            request.getQuantity()
        );

        movement.setPreviousQuantity(
            previousQuantity
        );

        movement.setNewQuantity(
            newQuantity
        );

        movement.setReason(
            normalizeNullable(
                request.getReason()
            )
        );

        User currentUser =
            currentUserService.getCurrentUser();

        movement.setUser(currentUser);

        movement.setOrganization(
            currentUser.getOrganization()
        );

        stock.setQuantity(newQuantity);

        Stock savedStock =
            stockRepository.save(stock);

        StockMovement savedMovement =
            stockMovementRepository.save(
                movement
            );

        return new StockMovementResult(
            toStockResponse(savedStock),
            toMovementResponse(savedMovement)
        );
    }

    public Page<StockMovementResponse> listMovements(
            Long productId,
            StockMovementType type,
            LocalDateTime start,
            LocalDateTime end,
            int page,
            int size
    ) {

        validatePagination(page, size);

        if (
            start != null
            && end != null
            && !start.isBefore(end)
        ) {
            throw new BusinessException(
                "A data inicial deve ser anterior à data final."
            );
        }

        Long organizationId =
            currentUserService.getOrganizationId();

        if (productId != null) {
            findProduct(
                productId,
                organizationId
            );
        }

        return stockMovementRepository
            .search(
                organizationId,
                productId,
                type,
                start,
                end,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                    )
                )
            )
            .map(this::toMovementResponse);
    }

    private Integer calculateNewQuantity(
            Integer currentQuantity,
            Integer movementQuantity,
            StockMovementType type
    ) {

        if (type == null) {
            throw new BusinessException(
                "O tipo da movimentação é obrigatório."
            );
        }

        int newQuantity;

        switch (type) {

            case ENTRY ->
                newQuantity =
                    currentQuantity
                    + movementQuantity;

            case EXIT -> {
                newQuantity =
                    currentQuantity
                    - movementQuantity;

                if (newQuantity < 0) {
                    throw new BusinessException(
                        "Estoque insuficiente para realizar esta saída."
                    );
                }
            }

            case ADJUSTMENT ->
                newQuantity =
                    movementQuantity;

            default ->
                throw new BusinessException(
                    "Tipo de movimentação inválido."
                );
        }

        return newQuantity;
    }

    private Stock createInitialStock(
            Product product
    ) {

        Stock stock = new Stock();

        stock.setProduct(product);
        stock.setQuantity(0);
        stock.setOrganization(
            product.getOrganization()
        );

        return stockRepository.save(stock);
    }

    private Product findProduct(
            Long productId,
            Long organizationId
    ) {

        return productRepository
            .findByIdAndOrganizationId(
                productId,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Produto não encontrado."
                    )
            );
    }

    private StockResponse toStockResponse(
            Stock stock
    ) {

        Product product =
            stock.getProduct();

        boolean lowStock =
            stock.getQuantity()
                <= product.getMinimumStock();

        return new StockResponse(
            stock.getId(),
            product.getId(),
            product.getName(),
            product.getSku(),
            stock.getQuantity(),
            product.getMinimumStock(),
            lowStock,
            product.getActive(),
            stock.getUpdatedAt()
        );
    }

    private StockMovementResponse toMovementResponse(
            StockMovement movement
    ) {

        return new StockMovementResponse(
            movement.getId(),

            movement
                .getProduct()
                .getId(),

            movement
                .getProduct()
                .getName(),

            movement
                .getType()
                .name(),

            movement.getQuantity(),

            movement.getPreviousQuantity(),
            movement.getNewQuantity(),

            movement.getReason(),

            movement
                .getUser()
                .getId(),

            movement
                .getUser()
                .getName(),

            movement.getCreatedAt()
        );
    }

    private String normalizeNullable(
            String value
    ) {

        if (
            value == null
            || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private void validatePagination(
            int page,
            int size
    ) {

        if (page < 0) {
            throw new BusinessException(
                "A página não pode ser negativa."
            );
        }

        if (
            size < 1
            || size > 100
        ) {
            throw new BusinessException(
                "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }
}