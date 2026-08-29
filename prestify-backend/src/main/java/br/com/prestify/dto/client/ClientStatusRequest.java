package br.com.prestify.dto.client;

import jakarta.validation.constraints.NotNull;

public class ClientStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
    )
    private Boolean active;

    public ClientStatusRequest() {
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}