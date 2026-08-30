package br.com.prestify.controller;

import br.com.prestify.dto.financial.FinancialCreateRequest;
import br.com.prestify.dto.financial.FinancialResponse;
import br.com.prestify.dto.financial.FinancialStatusRequest;
import br.com.prestify.dto.financial.FinancialSummaryResponse;
import br.com.prestify.dto.financial.FinancialUpdateRequest;

import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;

import br.com.prestify.service.FinancialService;

import jakarta.validation.Valid;

import java.time.LocalDate;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/financial")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(
            FinancialService financialService
    ) {
        this.financialService =
            financialService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public FinancialResponse create(
            @Valid
            @RequestBody
            FinancialCreateRequest request
    ) {

        return financialService.create(
            request
        );
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public Page<FinancialResponse> list(

            @RequestParam(
                required = false
            )
            String search,

            @RequestParam(
                required = false
            )
            FinancialType type,

            @RequestParam(
                required = false
            )
            FinancialStatus status,

            @RequestParam(
                required = false
            )
            LocalDate startDate,

            @RequestParam(
                required = false
            )
            LocalDate endDate,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "20"
            )
            int size

    ) {

        return financialService.list(
            search,
            type,
            status,
            startDate,
            endDate,
            page,
            size
        );
    }

    @GetMapping("/summary")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public FinancialSummaryResponse summary(

            @RequestParam(
                required = false
            )
            LocalDate startDate,

            @RequestParam(
                required = false
            )
            LocalDate endDate

    ) {

        return financialService.getSummary(
            startDate,
            endDate
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public FinancialResponse getById(
            @PathVariable Long id
    ) {

        return financialService
            .getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public FinancialResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            FinancialUpdateRequest request

    ) {

        return financialService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public FinancialResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            FinancialStatusRequest request

    ) {

        return financialService.changeStatus(
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

        financialService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}