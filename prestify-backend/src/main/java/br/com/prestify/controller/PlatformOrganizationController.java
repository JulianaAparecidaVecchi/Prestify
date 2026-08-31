package br.com.prestify.controller;

import br.com.prestify.dto.platform.PlatformOrganizationCreateRequest;
import br.com.prestify.dto.platform.PlatformOrganizationResponse;
import br.com.prestify.dto.platform.PlatformOrganizationStatusRequest;
import br.com.prestify.dto.platform.PlatformOrganizationUpdateRequest;

import br.com.prestify.service.PlatformOrganizationService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    "/api/platform/organizations"
)
@PreAuthorize(
    "hasRole('SUPER_ADMIN')"
)
public class PlatformOrganizationController {

    private final PlatformOrganizationService
        platformOrganizationService;

    public PlatformOrganizationController(
            PlatformOrganizationService platformOrganizationService
    ) {
        this.platformOrganizationService =
            platformOrganizationService;
    }

    @GetMapping
    public ResponseEntity<
        Page<PlatformOrganizationResponse>
    > list(
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

        return ResponseEntity.ok(
            platformOrganizationService
                .list(
                    search,
                    active,
                    page,
                    size
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<
        PlatformOrganizationResponse
    > getById(
            @PathVariable
            Long id
    ) {

        return ResponseEntity.ok(
            platformOrganizationService
                .getById(id)
        );
    }

    @PostMapping
    public ResponseEntity<
        PlatformOrganizationResponse
    > create(
            @Valid
            @RequestBody
            PlatformOrganizationCreateRequest request
    ) {

        PlatformOrganizationResponse
            response =
                platformOrganizationService
                    .create(request);

        return ResponseEntity
            .status(
                HttpStatus.CREATED
            )
            .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<
        PlatformOrganizationResponse
    > update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            PlatformOrganizationUpdateRequest request
    ) {

        return ResponseEntity.ok(
            platformOrganizationService
                .update(
                    id,
                    request
                )
        );
    }

    @PatchMapping(
        "/{id}/status"
    )
    public ResponseEntity<
        PlatformOrganizationResponse
    > changeStatus(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            PlatformOrganizationStatusRequest request
    ) {

        return ResponseEntity.ok(
            platformOrganizationService
                .changeStatus(
                    id,
                    request.getActive()
                )
        );
    }
}