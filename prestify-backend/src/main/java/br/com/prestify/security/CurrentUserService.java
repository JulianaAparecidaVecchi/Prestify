package br.com.prestify.security;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;
import br.com.prestify.enums.Role;
import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;
import br.com.prestify.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(
            UserRepository userRepository
    ) {
        this.userRepository =
            userRepository;
    }

    public User getCurrentUser() {

        var authentication =
            SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (
            !(authentication
                instanceof JwtAuthenticationToken jwtAuthentication)
        ) {

            throw new ResourceNotFoundException(
                "Usuário autenticado não encontrado."
            );
        }

        String email =
            jwtAuthentication
                .getToken()
                .getSubject();

        return userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Usuário autenticado não encontrado."
                    )
            );
    }

    public boolean isSuperAdmin() {

        return getCurrentUser()
            .getRole()
            == Role.SUPER_ADMIN;
    }

    public Organization
        getOrganization() {

        User user =
            getCurrentUser();

        if (
            user.getRole()
                == Role.SUPER_ADMIN
        ) {

            throw new BusinessException(
                "Usuários da plataforma não possuem organização."
            );
        }

        Organization organization =
            user.getOrganization();

        if (organization == null) {

            throw new BusinessException(
                "O usuário autenticado não possui organização."
            );
        }

        return organization;
    }

    public Long getOrganizationId() {

        return getOrganization()
            .getId();
    }
}