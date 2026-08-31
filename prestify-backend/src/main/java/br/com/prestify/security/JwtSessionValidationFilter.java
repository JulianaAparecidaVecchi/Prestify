package br.com.prestify.security;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;

import br.com.prestify.repository.OrganizationRepository;
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

    private final UserRepository
        userRepository;

    private final OrganizationRepository
        organizationRepository;

    public JwtSessionValidationFilter(
            UserRepository userRepository,
            OrganizationRepository organizationRepository
    ) {

        this.userRepository =
            userRepository;

        this.organizationRepository =
            organizationRepository;
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
            ||
            email.isBlank()
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
                .findByEmailIgnoreCase(
                    email
                )
                .orElse(null);

        if (
            user == null
        ) {

            reject(
                response,
                request,
                "Sessão inválida."
            );

            return;
        }

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

        if (
            jwtRole == null
            ||
            !jwtRole.equals(
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

        /*
         * SUPER_ADMIN pertence à plataforma
         * e não deve possuir organização.
         */
        if (
            user.getRole()
                == Role.SUPER_ADMIN
        ) {

            if (
                user.getOrganization()
                    != null
            ) {

                reject(
                    response,
                    request,
                    "Configuração inválida para usuário da plataforma."
                );

                return;
            }

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        /*
         * Todos os usuários de empresas
         * precisam pertencer a uma organização.
         */
        if (
            user.getOrganization()
                == null
        ) {

            reject(
                response,
                request,
                "O usuário não possui uma organização válida."
            );

            return;
        }

        Long currentOrganizationId =
            user
                .getOrganization()
                .getId();

        Long jwtOrganizationId =
            getLongClaim(
                jwtAuthentication,
                "organizationId"
            );

        if (
            jwtOrganizationId == null
            ||
            !jwtOrganizationId.equals(
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

        /*
         * A organização é consultada diretamente
         * no banco. Assim não dependemos de carregar
         * a associação LAZY do User dentro do filtro.
         */
        Organization organization =
            organizationRepository
                .findById(
                    currentOrganizationId
                )
                .orElse(null);

        if (
            organization == null
        ) {

            reject(
                response,
                request,
                "A organização da conta não existe mais."
            );

            return;
        }

        if (
            !Boolean.TRUE.equals(
                organization.getActive()
            )
        ) {

            reject(
                response,
                request,
                "A empresa vinculada a esta conta está desativada."
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

        if (
            value == null
        ) {

            return null;
        }

        if (
            value
                instanceof Number number
        ) {

            return number.longValue();
        }

        try {

            return Long.valueOf(
                value.toString()
            );

        } catch (
            NumberFormatException ex
        ) {

            return null;
        }
    }

    private void reject(
            HttpServletResponse response,
            HttpServletRequest request,
            String message
    ) throws IOException {

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
            + escapeJson(
                message
            )
            + "\","
            + "\"path\":\""
            + escapeJson(
                request.getRequestURI()
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