package br.com.prestify.dto.user;

import jakarta.validation.constraints.NotNull;

public class UserStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
    )
    private Boolean active;

    public UserStatusRequest() {
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