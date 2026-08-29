package br.com.prestify.controller;

import br.com.prestify.dto.service.ServiceCreateRequest;
import br.com.prestify.dto.service.ServiceResponse;
import br.com.prestify.dto.service.ServiceStatusRequest;
import br.com.prestify.dto.service.ServiceUpdateRequest;

import br.com.prestify.service.BusinessServiceService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
public class BusinessServiceController {

    private final BusinessServiceService service;

    public BusinessServiceController(
            BusinessServiceService service
    ) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<ServiceResponse> list(

            @RequestParam(
                defaultValue = ""
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
                defaultValue = "10"
            )
            int size

    ) {

        return service.list(
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
    public ServiceResponse getById(
            @PathVariable Long id
    ) {

        return service.getById(id);
    }

    @PostMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ResponseEntity<ServiceResponse> create(
            @Valid
            @RequestBody
            ServiceCreateRequest request
    ) {

        ServiceResponse response =
            service.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ServiceResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ServiceUpdateRequest request
    ) {

        return service.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ServiceResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ServiceStatusRequest request
    ) {

        return service.changeStatus(
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

        service.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}