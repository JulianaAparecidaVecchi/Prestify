package br.com.prestify.dto.service;

import jakarta.validation.constraints.NotNull;

public class ServiceStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
    )
    private Boolean active;

    public ServiceStatusRequest() {
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }
}