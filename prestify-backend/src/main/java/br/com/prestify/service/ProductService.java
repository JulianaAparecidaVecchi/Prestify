package br.com.prestify.service;

import br.com.prestify.dto.product.ProductCreateRequest;
import br.com.prestify.dto.product.ProductResponse;
import br.com.prestify.dto.product.ProductUpdateRequest;

import br.com.prestify.entity.Product;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.ProductRepository;

import br.com.prestify.security.CurrentUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public ProductService(
            ProductRepository productRepository,
            CurrentUserService currentUserService
    ) {
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    public ProductResponse create(
            ProductCreateRequest request
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        String sku = normalizeRequired(
            request.getSku()
        );

        if (
            productRepository
                .existsByOrganizationIdAndSkuIgnoreCase(
                    organizationId,
                    sku
                )
        ) {
            throw new BusinessException(
                "Já existe um produto com este SKU."
            );
        }

        Product product = new Product();

        product.setName(
            normalizeRequired(request.getName())
        );

        product.setSku(sku);

        product.setDescription(
            normalizeNullable(
                request.getDescription()
            )
        );

        product.setSalePrice(
            request.getSalePrice()
        );

        product.setCostPrice(
            request.getCostPrice()
        );

        product.setUnit(
            normalizeRequired(request.getUnit())
        );

        product.setMinimumStock(
            request.getMinimumStock()
        );

        product.setActive(true);

        product.setOrganization(
            currentUserService
                .getCurrentUser()
                .getOrganization()
        );

        return toResponse(
            productRepository.save(product)
        );
    }

    public Page<ProductResponse> list(
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

        return productRepository
            .search(
                organizationId,
                normalizedSearch,
                active,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.ASC,
                        "name"
                    )
                )
            )
            .map(this::toResponse);
    }

    public ProductResponse getById(
            Long id
    ) {
        return toResponse(
            findProduct(id)
        );
    }

    public ProductResponse update(
            Long id,
            ProductUpdateRequest request
    ) {

        Product product =
            findProduct(id);

        Long organizationId =
            currentUserService.getOrganizationId();

        String sku =
            normalizeRequired(
                request.getSku()
            );

        if (
            productRepository
                .existsByOrganizationIdAndSkuIgnoreCaseAndIdNot(
                    organizationId,
                    sku,
                    id
                )
        ) {
            throw new BusinessException(
                "Já existe um produto com este SKU."
            );
        }

        product.setName(
            normalizeRequired(
                request.getName()
            )
        );

        product.setSku(sku);

        product.setDescription(
            normalizeNullable(
                request.getDescription()
            )
        );

        product.setSalePrice(
            request.getSalePrice()
        );

        product.setCostPrice(
            request.getCostPrice()
        );

        product.setUnit(
            normalizeRequired(
                request.getUnit()
            )
        );

        product.setMinimumStock(
            request.getMinimumStock()
        );

        return toResponse(
            productRepository.save(product)
        );
    }

    public ProductResponse changeStatus(
            Long id,
            Boolean active
    ) {

        Product product =
            findProduct(id);

        product.setActive(active);

        return toResponse(
            productRepository.save(product)
        );
    }

    public void delete(
            Long id
    ) {

        Product product =
            findProduct(id);

        /*
         * Exclusão lógica.
         * O produto permanece no banco para
         * preservar o histórico de estoque,
         * compras e vendas futuras.
         */
        product.setActive(false);

        productRepository.save(product);
    }

    private Product findProduct(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

        return productRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Produto não encontrado."
                    )
            );
    }

    private String normalizeRequired(
            String value
    ) {
        return value.trim();
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

    private ProductResponse toResponse(
            Product product
    ) {

        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getSku(),
            product.getDescription(),
            product.getSalePrice(),
            product.getCostPrice(),
            product.getUnit(),
            product.getMinimumStock(),
            product.getActive(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}