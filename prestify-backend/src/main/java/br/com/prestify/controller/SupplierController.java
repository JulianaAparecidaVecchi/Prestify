package br.com.prestify.controller;

import br.com.prestify.dto.supplier.SupplierCreateRequest;
import br.com.prestify.dto.supplier.SupplierResponse;
import br.com.prestify.dto.supplier.SupplierStatusRequest;
import br.com.prestify.dto.supplier.SupplierUpdateRequest;

import br.com.prestify.service.SupplierService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(
            SupplierService supplierService
    ) {
        this.supplierService =
            supplierService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public SupplierResponse create(
            @Valid
            @RequestBody
            SupplierCreateRequest request
    ) {

        return supplierService.create(request);
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<SupplierResponse> list(

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

        return supplierService.list(
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
    public SupplierResponse getById(
            @PathVariable Long id
    ) {

        return supplierService
            .getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public SupplierResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            SupplierUpdateRequest request

    ) {

        return supplierService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public SupplierResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            SupplierStatusRequest request

    ) {

        return supplierService.changeStatus(
            id,
            request
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        supplierService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}