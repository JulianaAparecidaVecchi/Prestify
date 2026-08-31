package br.com.prestify.security;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;
import br.com.prestify.enums.SystemModule;

import br.com.prestify.repository.OrganizationRepository;

import br.com.prestify.rules.PlanRules;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Set;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ModuleAccessFilter
        extends OncePerRequestFilter {

    private final OrganizationRepository
        organizationRepository;

    private final CurrentUserService
        currentUserService;

    public ModuleAccessFilter(
            OrganizationRepository organizationRepository,
            CurrentUserService currentUserService
    ) {

        this.organizationRepository =
            organizationRepository;

        this.currentUserService =
            currentUserService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication authentication =
            SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (
            authentication == null
            ||
            !authentication
                .isAuthenticated()
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        String uri =
            request.getRequestURI();

        /*
         * Rotas da administração
         * da plataforma não fazem
         * parte dos módulos das
         * empresas.
         */
        if (
            matchesPath(
                uri,
                "/api/platform"
            )
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        SystemModule requiredModule =
            resolveRequiredModule(
                uri
            );

        /*
         * Endpoint sem módulo
         * operacional associado.
         */
        if (
            requiredModule == null
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        User currentUser;

        try {

            currentUser =
                currentUserService
                    .getCurrentUser();

        } catch (
            Exception ex
        ) {

            writeForbidden(
                response,
                request,
                "Não foi possível validar o usuário."
            );

            return;
        }

        /*
         * SUPER_ADMIN pertence à
         * plataforma Prestify.
         *
         * Ele não pode operar os
         * módulos internos de uma
         * empresa.
         */
        if (
            currentUser.getRole()
                == Role.SUPER_ADMIN
        ) {

            writeForbidden(
                response,
                request,
                "Usuários da plataforma não possuem acesso aos módulos operacionais das empresas."
            );

            return;
        }

        Long organizationId;

        try {

            organizationId =
                currentUserService
                    .getOrganizationId();

        } catch (
            Exception ex
        ) {

            writeForbidden(
                response,
                request,
                "Não foi possível validar a organização."
            );

            return;
        }

        Organization organization =
            organizationRepository
                .findById(
                    organizationId
                )
                .orElse(null);

        if (
            organization == null
        ) {

            writeForbidden(
                response,
                request,
                "Organização não encontrada."
            );

            return;
        }

        if (
            !Boolean.TRUE.equals(
                organization.getActive()
            )
        ) {

            writeForbidden(
                response,
                request,
                "Esta organização está desativada."
            );

            return;
        }

        /*
         * PRIMEIRA PROTEÇÃO:
         *
         * O plano precisa permitir
         * o módulo.
         */
        if (
            !PlanRules
                .isModuleAllowed(
                    organization
                        .getPlan(),
                    requiredModule
                )
        ) {

            writeForbidden(
                response,
                request,
                "O módulo "
                    + formatModuleName(
                        requiredModule
                    )
                    + " não está disponível no plano "
                    + PlanRules
                        .getDisplayName(
                            organization
                                .getPlan()
                        )
                    + "."
            );

            return;
        }

        /*
         * Serviços é obrigatório
         * em todos os planos.
         */
        if (
            requiredModule
                == SystemModule.SERVICES
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        /*
         * SEGUNDA PROTEÇÃO:
         *
         * Além de pertencer ao plano,
         * o OWNER precisa ter deixado
         * o módulo ativado.
         */
        Set<SystemModule>
            enabledModules =
                PlanRules
                    .normalizeModules(
                        organization
                            .getPlan(),
                        organization
                            .getEnabledModules()
                    );

        if (
            !enabledModules.contains(
                requiredModule
            )
        ) {

            writeForbidden(
                response,
                request,
                "O módulo "
                    + formatModuleName(
                        requiredModule
                    )
                    + " está desativado para esta organização."
            );

            return;
        }

        filterChain.doFilter(
            request,
            response
        );
    }

    private SystemModule
        resolveRequiredModule(
            String uri
        ) {

        if (
            matchesPath(
                uri,
                "/api/appointments"
            )
        ) {

            return SystemModule.AGENDA;
        }

        if (
            matchesPath(
                uri,
                "/api/clients"
            )
        ) {

            return SystemModule.CLIENTS;
        }

        if (
            matchesPath(
                uri,
                "/api/services"
            )
        ) {

            return SystemModule.SERVICES;
        }

        if (
            matchesPath(
                uri,
                "/api/products"
            )
        ) {

            return SystemModule.PRODUCTS;
        }

        if (
            matchesPath(
                uri,
                "/api/stocks"
            )
        ) {

            return SystemModule.STOCK;
        }

        if (
            matchesPath(
                uri,
                "/api/suppliers"
            )
        ) {

            return SystemModule.SUPPLIERS;
        }

        if (
            matchesPath(
                uri,
                "/api/financial"
            )
        ) {

            return SystemModule.FINANCIAL;
        }

        if (
            matchesPath(
                uri,
                "/api/reports"
            )
        ) {

            return SystemModule.REPORTS;
        }

        if (
            matchesPath(
                uri,
                "/api/users"
            )
        ) {

            return SystemModule.USERS;
        }

        return null;
    }

    private boolean matchesPath(
            String uri,
            String basePath
    ) {

        return uri.equals(
            basePath
        )
        ||
        uri.startsWith(
            basePath + "/"
        );
    }

    private String formatModuleName(
            SystemModule module
    ) {

        return switch (module) {

            case AGENDA ->
                "Agenda";

            case CLIENTS ->
                "Clientes";

            case SERVICES ->
                "Serviços";

            case PRODUCTS ->
                "Produtos";

            case STOCK ->
                "Estoque";

            case SUPPLIERS ->
                "Fornecedores";

            case FINANCIAL ->
                "Financeiro";

            case REPORTS ->
                "Relatórios";

            case USERS ->
                "Usuários";
        };
    }

    private void writeForbidden(
            HttpServletResponse response,
            HttpServletRequest request,
            String message
    ) throws IOException {

        response.setStatus(
            HttpServletResponse
                .SC_FORBIDDEN
        );

        response.setContentType(
            "application/json"
        );

        response.setCharacterEncoding(
            "UTF-8"
        );

        String json =
            "{"
            + "\"status\":403,"
            + "\"error\":\"Forbidden\","
            + "\"message\":\""
            + escapeJson(
                message
            )
            + "\","
            + "\"path\":\""
            + escapeJson(
                request
                    .getRequestURI()
            )
            + "\""
            + "}";

        response
            .getWriter()
            .write(
                json
            );
    }

    private String escapeJson(
            String value
    ) {

        if (
            value == null
        ) {

            return "";
        }

        return value
            .replace(
                "\\",
                "\\\\"
            )
            .replace(
                "\"",
                "\\\""
            );
    }
}