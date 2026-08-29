package br.com.prestify.controller;

import br.com.prestify.dto.appointment.AppointmentCreateRequest;
import br.com.prestify.dto.appointment.AppointmentResponse;
import br.com.prestify.dto.appointment.AppointmentStatusRequest;
import br.com.prestify.dto.appointment.AppointmentUpdateRequest;

import br.com.prestify.enums.AppointmentStatus;

import br.com.prestify.service.AppointmentService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService
    ) {
        this.appointmentService =
            appointmentService;
    }

    @GetMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public Page<AppointmentResponse> list(

            @RequestParam
            LocalDateTime start,

            @RequestParam
            LocalDateTime end,

            @RequestParam(
                required = false
            )
            Long professionalId,

            @RequestParam(
                required = false
            )
            AppointmentStatus status,

            @RequestParam(
                defaultValue = "0"
            )
            int page,

            @RequestParam(
                defaultValue = "20"
            )
            int size

    ) {

        return appointmentService.list(
            start,
            end,
            professionalId,
            status,
            page,
            size
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public AppointmentResponse getById(
            @PathVariable Long id
    ) {

        return appointmentService
            .getById(id);
    }

    @PostMapping
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public ResponseEntity<AppointmentResponse> create(
            @Valid
            @RequestBody
            AppointmentCreateRequest request
    ) {

        AppointmentResponse response =
            appointmentService.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public AppointmentResponse update(

            @PathVariable Long id,

            @Valid
            @RequestBody
            AppointmentUpdateRequest request
    ) {

        return appointmentService.update(
            id,
            request
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE')"
    )
    public AppointmentResponse changeStatus(

            @PathVariable Long id,

            @Valid
            @RequestBody
            AppointmentStatusRequest request
    ) {

        return appointmentService
            .changeStatus(
                id,
                request.getStatus()
            );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
        "hasAnyRole('OWNER', 'ADMIN', 'MANAGER')"
    )
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        appointmentService.delete(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}