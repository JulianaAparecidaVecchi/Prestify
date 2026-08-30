package br.com.prestify.security;

import br.com.prestify.entity.User;
import br.com.prestify.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtSessionValidationFilter
        extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public JwtSessionValidationFilter(
            UserRepository userRepository
    ) {
        this.userRepository =
            userRepository;
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
         * Rotas públicas ou requisições que ainda
         * não possuem um JWT autenticado passam
         * normalmente para o restante da cadeia.
         */
        if (
            !(authentication
                instanceof JwtAuthenticationToken jwtAuthentication)
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        String email =
            jwtAuthentication
                .getToken()
                .getSubject();

        if (
            email == null
            || email.isBlank()
        ) {

            reject(
                response,
                request,
                "Sessão inválida."
            );

            return;
        }

        User user =
            userRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        /*
         * Usuário removido ou inexistente.
         */
        if (user == null) {

            reject(
                response,
                request,
                "Sessão inválida."
            );

            return;
        }

        /*
         * Usuário desativado não pode continuar
         * utilizando um JWT antigo.
         */
        if (
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            reject(
                response,
                request,
                "Usuário desativado."
            );

            return;
        }

        Long jwtTokenVersion =
            getLongClaim(
                jwtAuthentication,
                "tokenVersion"
            );

        /*
         * JWTs antigos, criados antes da
         * implementação do tokenVersion,
         * são tratados como versão zero.
         */
        long tokenVersion =
            jwtTokenVersion == null
                ? 0L
                : jwtTokenVersion;

        if (
            tokenVersion
                != user.getTokenVersion()
        ) {

            reject(
                response,
                request,
                "A sessão expirou. Faça login novamente."
            );

            return;
        }

        String jwtRole =
            jwtAuthentication
                .getToken()
                .getClaimAsString(
                    "role"
                );

        /*
         * Uma alteração de permissão invalida
         * imediatamente o JWT com a função antiga.
         */
        if (
            jwtRole == null
            || !jwtRole.equals(
                user
                    .getRole()
                    .name()
            )
        ) {

            reject(
                response,
                request,
                "As permissões da conta foram alteradas. Faça login novamente."
            );

            return;
        }

        Long jwtOrganizationId =
            getLongClaim(
                jwtAuthentication,
                "organizationId"
            );

        Long currentOrganizationId =
            user
                .getOrganization()
                .getId();

        /*
         * Também impedimos que uma sessão antiga
         * continue válida caso o usuário mude
         * de organização.
         */
        if (
            jwtOrganizationId == null
            || !jwtOrganizationId.equals(
                currentOrganizationId
            )
        ) {

            reject(
                response,
                request,
                "A organização da conta foi alterada. Faça login novamente."
            );

            return;
        }

        filterChain.doFilter(
            request,
            response
        );
    }

    private Long getLongClaim(
            JwtAuthenticationToken authentication,
            String claimName
    ) {

        Object value =
            authentication
                .getToken()
                .getClaim(
                    claimName
                );

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        try {

            return Long.valueOf(
                value.toString()
            );

        } catch (NumberFormatException ex) {

            return null;
        }
    }

    private void reject(
            HttpServletResponse response,
            HttpServletRequest request,
            String message
    ) throws IOException {

        /*
         * Remove explicitamente a autenticação
         * inválida do contexto.
         */
        SecurityContextHolder
            .clearContext();

        response.setStatus(
            HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
            "application/json"
        );

        response.setCharacterEncoding(
            "UTF-8"
        );

        String json =
            "{"
            + "\"status\":401,"
            + "\"error\":\"Unauthorized\","
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