package br.com.prestify.service;

import br.com.prestify.dto.user.UserCreateRequest;
import br.com.prestify.dto.user.UserResponse;
import br.com.prestify.dto.user.UserUpdateRequest;

import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.ResourceNotFoundException;

import br.com.prestify.repository.UserRepository;

import br.com.prestify.security.CurrentUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserResponse> list(
            String search,
            int page,
            int size
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

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

    public UserResponse getById(
            Long id
    ) {

        return toResponse(
            findUser(id)
        );
    }

    public UserResponse create(
            UserCreateRequest request
    ) {

        User currentUser =
            currentUserService.getCurrentUser();

        validateRoleManagement(
            currentUser,
            request.getRole()
        );

        String email =
            request
                .getEmail()
                .trim()
                .toLowerCase();

        if (
            userRepository
                .existsByEmailIgnoreCase(email)
        ) {

            throw new BusinessException(
                "Este e-mail já está cadastrado."
            );
        }

        User user = new User();

        user.setName(
            request.getName().trim()
        );

        user.setEmail(email);

        user.setPassword(
            passwordEncoder.encode(
                request.getPassword()
            )
        );

        user.setRole(
            request.getRole()
        );

        user.setActive(true);

        user.setOrganization(
            currentUser.getOrganization()
        );

        return toResponse(
            userRepository.save(user)
        );
    }

    public UserResponse update(
            Long id,
            UserUpdateRequest request
    ) {

        User currentUser =
            currentUserService.getCurrentUser();

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
            request
                .getEmail()
                .trim()
                .toLowerCase();

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

        user.setName(
            request.getName().trim()
        );

        user.setEmail(email);

        user.setRole(
            request.getRole()
        );

        if (
            request.getPassword() != null
            &&
            !request.getPassword()
                .isBlank()
        ) {

            if (
                request.getPassword()
                    .length() < 8
            ) {

                throw new BusinessException(
                    "A nova senha deve possuir pelo menos 8 caracteres."
                );
            }

            user.setPassword(
                passwordEncoder.encode(
                    request.getPassword()
                )
            );
        }

        return toResponse(
            userRepository.save(user)
        );
    }

    public UserResponse changeStatus(
            Long id,
            Boolean active
    ) {

        User currentUser =
            currentUserService.getCurrentUser();

        User user =
            findUser(id);

        validateTargetUser(
            currentUser,
            user
        );

        if (
            currentUser
                .getId()
                .equals(user.getId())
            &&
            !active
        ) {

            throw new BusinessException(
                "Você não pode desativar seu próprio usuário."
            );
        }

        user.setActive(active);

        return toResponse(
            userRepository.save(user)
        );
    }

    public void delete(
            Long id
    ) {

        User currentUser =
            currentUserService.getCurrentUser();

        User user =
            findUser(id);

        validateTargetUser(
            currentUser,
            user
        );

        if (
            currentUser
                .getId()
                .equals(user.getId())
        ) {

            throw new BusinessException(
                "Você não pode excluir seu próprio usuário."
            );
        }

        /*
         * Exclusão lógica.
         *
         * Mantemos o usuário no banco
         * para preservar históricos
         * de agenda, estoque,
         * financeiro e auditoria.
         */
        user.setActive(false);

        userRepository.save(user);
    }

    private User findUser(
            Long id
    ) {

        Long organizationId =
            currentUserService.getOrganizationId();

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

    private void validateTargetUser(
            User currentUser,
            User targetUser
    ) {

        if (
            currentUser.getRole() == Role.ADMIN
            &&
            targetUser.getRole() == Role.OWNER
        ) {

            throw new BusinessException(
                "Um ADMIN não pode alterar um OWNER."
            );
        }
    }

    private void validateRoleManagement(
            User currentUser,
            Role requestedRole
    ) {

        if (
            currentUser.getRole() == Role.ADMIN
            &&
            requestedRole == Role.OWNER
        ) {

            throw new BusinessException(
                "Um ADMIN não pode atribuir o perfil OWNER."
            );
        }
    }

    private UserResponse toResponse(
            User user
    ) {

        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}