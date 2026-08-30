package br.com.prestify.dto.settings;

import br.com.prestify.enums.SystemModule;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class OrganizationModulesRequest {

    @NotNull(
        message = "A lista de módulos é obrigatória."
    )
    private Set<SystemModule> modules;

    public Set<SystemModule> getModules() {
        return modules;
    }

    public void setModules(
            Set<SystemModule> modules
    ) {
        this.modules = modules;
    }
}