package br.com.prestify.dto.settings;

import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SystemModule;

import java.util.Set;

public class OrganizationSettingsResponse {

    private final Long id;
    private final String name;
    private final String document;
    private final String email;
    private final String phone;
    private final String address;
    private final PlanType plan;
    private final Set<SystemModule> enabledModules;

    public OrganizationSettingsResponse(
            Long id,
            String name,
            String document,
            String email,
            String phone,
            String address,
            PlanType plan,
            Set<SystemModule> enabledModules
    ) {
        this.id = id;
        this.name = name;
        this.document = document;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.plan = plan;
        this.enabledModules =
            enabledModules;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDocument() {
        return document;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public PlanType getPlan() {
        return plan;
    }

    public Set<SystemModule>
        getEnabledModules() {

        return enabledModules;
    }
}