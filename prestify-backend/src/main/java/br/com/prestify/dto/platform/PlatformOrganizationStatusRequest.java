package br.com.prestify.dto.platform;

import jakarta.validation.constraints.NotNull;

public class PlatformOrganizationStatusRequest {

    @NotNull(
        message =
            "Informe o status da empresa."
    )
    private Boolean active;

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }
}