package br.com.prestify.dto.platform.user;

import jakarta.validation.constraints.NotNull;

public class PlatformUserStatusRequest {

    @NotNull(
        message =
            "Informe o status do usuário."
    )
    private Boolean active;

    public PlatformUserStatusRequest() {
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