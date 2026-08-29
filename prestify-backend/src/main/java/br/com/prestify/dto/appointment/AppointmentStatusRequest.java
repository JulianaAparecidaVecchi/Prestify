package br.com.prestify.dto.appointment;

import br.com.prestify.enums.AppointmentStatus;

import jakarta.validation.constraints.NotNull;

public class AppointmentStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
    )
    private AppointmentStatus status;

    public AppointmentStatusRequest() {
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(
            AppointmentStatus status
    ) {
        this.status = status;
    }
}