package br.com.prestify.dto.supplier;

import jakarta.validation.constraints.NotNull;

public class SupplierStatusRequest {

    @NotNull(
        message = "O status é obrigatório."
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