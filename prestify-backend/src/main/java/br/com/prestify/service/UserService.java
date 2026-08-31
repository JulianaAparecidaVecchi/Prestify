package br.com.prestify.service;

import br.com.prestify.dto.user.UserCreateRequest;
import br.com.prestify.dto.user.UserResponse;
import br.com.prestify.dto.user.UserUpdateRequest;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import br.com.prestify.security.CurrentUserService;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository
        userRepository;

    private final CurrentUserService
        currentUserService;

    private final PasswordEncoder
        passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
            userRepository;

        this.currentUserService =
            currentUserService;

        this.passwordEncoder =
            passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(
            String search,
            int page,
            int size
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        String term =
            search == null
                ? ""
                : search.trim();

        Page<User> users =
            userRepository.search(
                organizationId,
                term,
                PageRequest.of(
                    page,
                    size,
                    Sort.by(
                        Sort.Direction.ASC,
                        "name"
                    )
                )
            );

        return users.map(
            this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse>
        listProfessionals() {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        return userRepository
            .findByOrganizationIdAndActiveTrueOrderByNameAsc(
                organizationId
            )
            .stream()
            .map(
                this::toResponse
            )
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getById(
            Long id
    ) {

        return toResponse(
            findUser(id)
        );
    }

    @Transactional
    public UserResponse create(
            UserCreateRequest request
    ) {

        User currentUser =
            currentUserService
                .getCurrentUser();

        validateTenantAdministrator(
            currentUser
        );

        validateRoleManagement(
            currentUser,
            request.getRole()
        );

        validateActiveUserLimit(
            currentUser
                .getOrganization()
        );

        String email =
            normalizeEmail(
                request.getEmail()
            );

        if (
            userRepository
                .existsByEmailIgnoreCase(
                    email
                )
        ) {

            throw new BusinessException(
                "Este e-mail já está cadastrado."
            );
        }

        User user =
            new User();

        user.setName(
            request
                .getName()
                .trim()
        );

        user.setEmail(
            email
        );

        user.setPassword(
            passwordEncoder.encode(
                request.getPassword()
            )
        );

        user.setRole(
            request.getRole()
        );

        user.setActive(
            true
        );

        user.setOrganization(
            currentUser
                .getOrganization()
        );

        return toResponse(
            userRepository.save(
                user
            )
        );
    }

    @Transactional
    public UserResponse update(
            Long id,
            UserUpdateRequest request
    ) {

        User currentUser =
            currentUserService
                .getCurrentUser();

        validateTenantAdministrator(
            currentUser
        );

        User user =
            findUser(id);

        validateTargetUser(
            currentUser,
            user
        );

        validateRoleManagement(
            currentUser,
            request.getRole()
        );

        String email =
            normalizeEmail(
                request.getEmail()
            );

        if (
            userRepository
                .existsByEmailIgnoreCaseAndIdNot(
                    email,
                    user.getId()
                )
        ) {

            throw new BusinessException(
                "Este e-mail já está cadastrado."
            );
        }

        boolean invalidateSession =
            false;

        user.setName(
            request
                .getName()
                .trim()
        );

        user.setEmail(
            email
        );

        if (
            user.getRole()
                != request.getRole()
        ) {

            user.setRole(
                request.getRole()
            );

            invalidateSession =
                true;
        }

        if (
            request.getPassword()
                != null
            &&
            !request
                .getPassword()
                .isBlank()
        ) {

            if (
                request
                    .getPassword()
                    .length()
                    < 8
            ) {

                throw new BusinessException(
                    "A nova senha deve possuir pelo menos 8 caracteres."
                );
            }

            user.setPassword(
                passwordEncoder.encode(
                    request
                        .getPassword()
                )
            );

            invalidateSession =
                true;
        }

        if (invalidateSession) {

            user.incrementTokenVersion();
        }

        return toResponse(
            userRepository.save(
                user
            )
        );
    }

    @Transactional
    public UserResponse changeStatus(
            Long id,
            Boolean active
    ) {

        if (active == null) {

            throw new BusinessException(
                "Informe o status do usuário."
            );
        }

        User currentUser =
            currentUserService
                .getCurrentUser();

        validateTenantAdministrator(
            currentUser
        );

        User user =
            findUser(id);

        validateTargetUser(
            currentUser,
            user
        );

        if (
            currentUser
                .getId()
                .equals(
                    user.getId()
                )
            &&
            !active
        ) {

            throw new BusinessException(
                "Você não pode desativar seu próprio usuário."
            );
        }

        /*
         * Se o usuário está inativo e
         * será reativado, primeiro
         * verificamos o limite do plano.
         */
        if (
            Boolean.TRUE.equals(
                active
            )
            &&
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            validateActiveUserLimit(
                currentUser
                    .getOrganization()
            );
        }

        if (
            !active.equals(
                user.getActive()
            )
        ) {

            user.setActive(
                active
            );

            user.incrementTokenVersion();
        }

        return toResponse(
            userRepository.save(
                user
            )
        );
    }

    @Transactional
    public void delete(
            Long id
    ) {

        User currentUser =
            currentUserService
                .getCurrentUser();

        validateTenantAdministrator(
            currentUser
        );

        User user =
            findUser(id);

        validateTargetUser(
            currentUser,
            user
        );

        if (
            currentUser
                .getId()
                .equals(
                    user.getId()
                )
        ) {

            throw new BusinessException(
                "Você não pode excluir seu próprio usuário."
            );
        }

        /*
         * Exclusão lógica.
         */
        if (
            Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            user.setActive(
                false
            );

            user.incrementTokenVersion();
        }

        userRepository.save(
            user
        );
    }

    private void
        validateActiveUserLimit(
            Organization organization
        ) {

        if (organization == null) {

            throw new BusinessException(
                "Usuário sem organização vinculada."
            );
        }

        long currentActiveUsers =
            userRepository
                .countByOrganizationIdAndActiveTrue(
                    organization.getId()
                );

        if (
            PlanRules
                .canAddActiveUser(
                    organization
                        .getPlan(),
                    currentActiveUsers
                )
        ) {

            return;
        }

        int maximumUsers =
            PlanRules
                .getMaxActiveUsers(
                    organization
                        .getPlan()
                );

        throw new BusinessException(
            "O plano "
                + PlanRules
                    .getDisplayName(
                        organization
                            .getPlan()
                    )
                + " permite no máximo "
                + maximumUsers
                + " usuários ativos."
        );
    }

    private User findUser(
            Long id
    ) {

        Long organizationId =
            currentUserService
                .getOrganizationId();

        return userRepository
            .findByIdAndOrganizationId(
                id,
                organizationId
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Usuário não encontrado."
                    )
            );
    }

    private void
        validateTenantAdministrator(
            User currentUser
        ) {

        if (
            currentUser.getRole()
                == Role.SUPER_ADMIN
        ) {

            throw new BusinessException(
                "O SUPER_ADMIN não pode ser gerenciado pelos endpoints de usuários das empresas."
            );
        }

        if (
            currentUser
                .getOrganization()
                == null
        ) {

            throw new BusinessException(
                "Usuário sem organização vinculada."
            );
        }
    }

    private void validateTargetUser(
            User currentUser,
            User targetUser
    ) {

        if (
            targetUser.getRole()
                == Role.SUPER_ADMIN
        ) {

            throw new BusinessException(
                "Usuários da empresa não podem alterar um SUPER_ADMIN."
            );
        }

        if (
            currentUser.getRole()
                == Role.ADMIN
            &&
            targetUser.getRole()
                == Role.OWNER
        ) {

            throw new BusinessException(
                "Um ADMIN não pode alterar um OWNER."
            );
        }
    }

    private void
        validateRoleManagement(
            User currentUser,
            Role requestedRole
        ) {

        if (requestedRole == null) {

            throw new BusinessException(
                "Informe o perfil do usuário."
            );
        }

        if (
            requestedRole
                == Role.SUPER_ADMIN
        ) {

            throw new BusinessException(
                "Usuários das empresas não podem receber o perfil SUPER_ADMIN."
            );
        }

        if (
            currentUser.getRole()
                == Role.ADMIN
            &&
            requestedRole
                == Role.OWNER
        ) {

            throw new BusinessException(
                "Um ADMIN não pode atribuir o perfil OWNER."
            );
        }
    }

    private String normalizeEmail(
            String email
    ) {

        if (
            email == null
            ||
            email.isBlank()
        ) {

            throw new BusinessException(
                "Informe o e-mail do usuário."
            );
        }

        return email
            .trim()
            .toLowerCase();
    }

    private UserResponse toResponse(
            User user
    ) {

        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user
                .getRole()
                .name(),
            user.getActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}