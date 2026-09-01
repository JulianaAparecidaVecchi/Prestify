package br.com.prestify.controller;

import br.com.prestify.dto.platform.user.PlatformUserCreateRequest;
import br.com.prestify.dto.platform.user.PlatformUserResponse;
import br.com.prestify.dto.platform.user.PlatformUserStatusRequest;
import br.com.prestify.dto.platform.user.PlatformUserUpdateRequest;

import br.com.prestify.service.PlatformUserService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.DeleteMapping;
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
    "/api/platform/users"
)
@PreAuthorize(
    "hasRole('SUPER_ADMIN')"
)
public class PlatformUserController {

    private final PlatformUserService
        platformUserService;

    public PlatformUserController(
            PlatformUserService platformUserService
    ) {
        this.platformUserService =
            platformUserService;
    }

    @GetMapping
    public ResponseEntity<
        Page<PlatformUserResponse>
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
            platformUserService.list(
                search,
                active,
                page,
                size
            )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<
        PlatformUserResponse
    > getById(
            @PathVariable
            Long id
    ) {
        return ResponseEntity.ok(
            platformUserService
                .getById(
                    id
                )
        );
    }

    @PostMapping
    public ResponseEntity<
        PlatformUserResponse
    > create(
            @Valid
            @RequestBody
            PlatformUserCreateRequest request
    ) {
        PlatformUserResponse response =
            platformUserService.create(
                request
            );

        return ResponseEntity
            .status(
                HttpStatus.CREATED
            )
            .body(
                response
            );
    }

    @PutMapping("/{id}")
    public ResponseEntity<
        PlatformUserResponse
    > update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            PlatformUserUpdateRequest request
    ) {
        return ResponseEntity.ok(
            platformUserService.update(
                id,
                request
            )
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<
        PlatformUserResponse
    > changeStatus(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            PlatformUserStatusRequest request
    ) {
        return ResponseEntity.ok(
            platformUserService
                .changeStatus(
                    id,
                    request
                        .getActive()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable
            Long id
    ) {
        platformUserService.delete(
            id
        );

        return ResponseEntity
            .noContent()
            .build();
    }
}