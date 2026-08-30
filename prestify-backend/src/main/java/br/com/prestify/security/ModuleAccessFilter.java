package br.com.prestify.security;

import br.com.prestify.entity.Organization;
import br.com.prestify.enums.SystemModule;
import br.com.prestify.repository.OrganizationRepository;

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

        /*
         * Sem autenticação JWT válida,
         * deixamos o restante do Spring Security
         * decidir se a rota é pública ou protegida.
         */
        if (
            authentication == null
            || !authentication.isAuthenticated()
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        SystemModule requiredModule =
            resolveRequiredModule(
                request.getRequestURI()
            );

        /*
         * Dashboard, configurações, autenticação
         * e demais rotas não vinculadas a módulos
         * configuráveis passam normalmente.
         */
        if (requiredModule == null) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        /*
         * Serviços é o módulo obrigatório
         * do Prestify.
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

        Long organizationId;

        try {

            organizationId =
                currentUserService
                    .getOrganizationId();

        } catch (Exception ex) {

            writeForbidden(
                response,
                request,
                "Não foi possível validar os módulos da organização."
            );

            return;
        }

        if (organizationId == null) {

            writeForbidden(
                response,
                request,
                "Não foi possível validar os módulos da organização."
            );

            return;
        }

        Organization organization =
            organizationRepository
                .findById(
                    organizationId
                )
                .orElse(null);

        if (organization == null) {

            writeForbidden(
                response,
                request,
                "Organização não encontrada."
            );

            return;
        }

        Set<SystemModule> enabledModules =
            organization.getEnabledModules();

        if (
            enabledModules == null
            || !enabledModules.contains(
                requiredModule
            )
        ) {

            writeForbidden(
                response,
                request,
                "O módulo "
                    + requiredModule.name()
                    + " está desativado para esta organização."
            );

            return;
        }

        filterChain.doFilter(
            request,
            response
        );
    }

    private SystemModule resolveRequiredModule(
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

        return uri.equals(basePath)
            || uri.startsWith(
                basePath + "/"
            );
    }

    private void writeForbidden(
            HttpServletResponse response,
            HttpServletRequest request,
            String message
    ) throws IOException {

        response.setStatus(
            HttpServletResponse.SC_FORBIDDEN
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
            + escapeJson(message)
            + "\","
            + "\"path\":\""
            + escapeJson(
                request.getRequestURI()
            )
            + "\""
            + "}";

        response
            .getWriter()
            .write(json);
    }

    private String escapeJson(
            String value
    ) {

        if (value == null) {
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