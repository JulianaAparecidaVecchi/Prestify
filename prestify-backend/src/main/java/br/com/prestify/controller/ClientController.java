package br.com.prestify.controller;

import br.com.prestify.dto.client.ClientCreateRequest;
import br.com.prestify.dto.client.ClientResponse;
import br.com.prestify.dto.client.ClientStatusRequest;
import br.com.prestify.dto.client.ClientUpdateRequest;

import br.com.prestify.service.ClientService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(
            ClientService clientService
    ) {
        this.clientService = clientService;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<ClientResponse> list(

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

        return clientService.list(
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
    public ClientResponse getById(
            @PathVariable Long id
    ) {

        return clientService.getById(id);
    }

    @PostMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public ResponseEntity<ClientResponse> create(
            @Valid
            @RequestBody
            ClientCreateRequest request
    ) {

        ClientResponse response =
            clientService.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ClientResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ClientUpdateRequest request
    ) {

        return clientService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ClientResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ClientStatusRequest request
    ) {

        return clientService.changeStatus(
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

        clientService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}