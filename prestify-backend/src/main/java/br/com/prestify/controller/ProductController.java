package br.com.prestify.controller;

import br.com.prestify.dto.product.ProductCreateRequest;
import br.com.prestify.dto.product.ProductResponse;
import br.com.prestify.dto.product.ProductStatusRequest;
import br.com.prestify.dto.product.ProductUpdateRequest;

import br.com.prestify.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ResponseEntity<ProductResponse> create(
            @Valid
            @RequestBody
            ProductCreateRequest request
    ) {

        ProductResponse response =
            productService.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<ProductResponse> list(

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

        return productService.list(
            search,
            active,
            page,
            size
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public ProductResponse getById(
            @PathVariable Long id
    ) {

        return productService
            .getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ProductResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ProductUpdateRequest request
    ) {

        return productService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ProductResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ProductStatusRequest request
    ) {

        return productService
            .changeStatus(
                id,
                request.getActive()
            );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        productService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}