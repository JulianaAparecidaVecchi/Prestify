package br.com.prestify.controller;

import br.com.prestify.dto.user.UserCreateRequest;
import br.com.prestify.dto.user.UserResponse;
import br.com.prestify.dto.user.UserStatusRequest;
import br.com.prestify.dto.user.UserUpdateRequest;

import br.com.prestify.service.UserService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public Page<UserResponse> list(

            @RequestParam(
                defaultValue = ""
            )
            String search,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "10"
            )
            int size

    ) {

        return userService.list(
            search,
            page,
            size
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public UserResponse getById(
            @PathVariable Long id
    ) {

        return userService.getById(id);
    }

    @PostMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public ResponseEntity<UserResponse> create(
            @Valid
            @RequestBody
            UserCreateRequest request
    ) {

        UserResponse response =
            userService.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public UserResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            UserUpdateRequest request
    ) {

        return userService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN')"
    )
    public UserResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            UserStatusRequest request
    ) {

        return userService.changeStatus(
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

        userService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}