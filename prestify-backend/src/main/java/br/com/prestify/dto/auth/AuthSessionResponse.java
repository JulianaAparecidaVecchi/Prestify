package br.com.prestify.dto.auth;

import br.com.prestify.enums.SystemModule;

import java.util.Set;

public class AuthSessionResponse {

    private final Long userId;

    private final String name;

    private final String email;

    private final String role;

    private final Long organizationId;

    private final String organizationName;

    private final Set<SystemModule>
        enabledModules;

    public AuthSessionResponse(
            Long userId,
            String name,
            String email,
            String role,
            Long organizationId,
            String organizationName,
            Set<SystemModule> enabledModules
    ) {

        this.userId =
            userId;

        this.name =
            name;

        this.email =
            email;

        this.role =
            role;

        this.organizationId =
            organizationId;

        this.organizationName =
            organizationName;

        this.enabledModules =
            enabledModules;
    }

    public Long getUserId() {

        return userId;
    }

    public String getName() {

        return name;
    }

    public String getEmail() {

        return email;
    }

    public String getRole() {

        return role;
    }

    public Long getOrganizationId() {

        return organizationId;
    }

    public String getOrganizationName() {

        return organizationName;
    }

    public Set<SystemModule>
        getEnabledModules() {

        return enabledModules;
    }
}