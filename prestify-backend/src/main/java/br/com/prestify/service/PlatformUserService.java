package br.com.prestify.service;

import br.com.prestify.dto.platform.user.PlatformUserCreateRequest;
import br.com.prestify.dto.platform.user.PlatformUserResponse;
import br.com.prestify.dto.platform.user.PlatformUserUpdateRequest;

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

import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformUserService {

    private final UserRepository
        userRepository;

    private final CurrentUserService
        currentUserService;

    private final PasswordEncoder
        passwordEncoder;

    public PlatformUserService(
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
    public Page<PlatformUserResponse> list(
            String search,
            Boolean active,
            int page,
            int size
    ) {
        validateCurrentUser();

        String normalizedSearch =
            search == null
                ? ""
                : search.trim();

        int normalizedPage =
            Math.max(
                page,
                0
            );

        int normalizedSize =
            Math.min(
                Math.max(
                    size,
                    1
                ),
                100
            );

        return userRepository
            .searchPlatformUsers(
                normalizedSearch,
                Role.SUPER_ADMIN,
                active,
                PageRequest.of(
                    normalizedPage,
                    normalizedSize,
                    Sort.by(
                        Sort.Direction.ASC,
                        "name"
                    )
                )
            )
            .map(
                this::toResponse
            );
    }

    @Transactional(readOnly = true)
    public PlatformUserResponse getById(
            Long id
    ) {
        validateCurrentUser();

        return toResponse(
            findPlatformUser(
                id
            )
        );
    }

    @Transactional
    public PlatformUserResponse create(
            PlatformUserCreateRequest request
    ) {
        validateCurrentUser();

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
                request
                    .getPassword()
            )
        );

        user.setRole(
            Role.SUPER_ADMIN
        );

        user.setActive(
            true
        );

        /*
         * Usuários internos da
         * plataforma não pertencem
         * a nenhuma empresa.
         */
        user.setOrganization(
            null
        );

        return toResponse(
            userRepository.save(
                user
            )
        );
    }

    @Transactional
    public PlatformUserResponse update(
            Long id,
            PlatformUserUpdateRequest request
    ) {
        User currentUser =
            validateCurrentUser();

        User targetUser =
            findPlatformUser(
                id
            );

        String email =
            normalizeEmail(
                request.getEmail()
            );

        if (
            userRepository
                .existsByEmailIgnoreCaseAndIdNot(
                    email,
                    targetUser.getId()
                )
        ) {
            throw new BusinessException(
                "Este e-mail já está cadastrado."
            );
        }

        boolean invalidateSession =
            false;

        targetUser.setName(
            request
                .getName()
                .trim()
        );

        if (
            !targetUser
                .getEmail()
                .equalsIgnoreCase(
                    email
                )
        ) {
            targetUser.setEmail(
                email
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
            targetUser.setPassword(
                passwordEncoder.encode(
                    request
                        .getPassword()
                )
            );

            invalidateSession =
                true;
        }

        if (invalidateSession) {
            targetUser
                .incrementTokenVersion();
        }

        PlatformUserResponse response =
            toResponse(
                userRepository.save(
                    targetUser
                )
            );

        /*
         * Se o próprio usuário
         * alterou e-mail ou senha,
         * a sessão atual será
         * invalidada no próximo
         * request.
         */
        if (
            currentUser
                .getId()
                .equals(
                    targetUser.getId()
                )
        ) {
            return response;
        }

        return response;
    }

    @Transactional
    public PlatformUserResponse changeStatus(
            Long id,
            Boolean active
    ) {
        if (active == null) {
            throw new BusinessException(
                "Informe o status do usuário."
            );
        }

        User currentUser =
            validateCurrentUser();

        User targetUser =
            findPlatformUser(
                id
            );

        if (
            currentUser
                .getId()
                .equals(
                    targetUser.getId()
                )
            &&
            Boolean.FALSE.equals(
                active
            )
        ) {
            throw new BusinessException(
                "Você não pode desativar seu próprio usuário."
            );
        }

        if (
            !active.equals(
                targetUser
                    .getActive()
            )
        ) {
            targetUser.setActive(
                active
            );

            targetUser
                .incrementTokenVersion();
        }

        return toResponse(
            userRepository.save(
                targetUser
            )
        );
    }

    @Transactional
    public void delete(
            Long id
    ) {
        User currentUser =
            validateCurrentUser();

        User targetUser =
            findPlatformUser(
                id
            );

        if (
            currentUser
                .getId()
                .equals(
                    targetUser.getId()
                )
        ) {
            throw new BusinessException(
                "Você não pode excluir seu próprio usuário."
            );
        }

        /*
         * Exclusão lógica.
         *
         * Mantemos o registro para
         * auditoria e histórico.
         */
        if (
            Boolean.TRUE.equals(
                targetUser
                    .getActive()
            )
        ) {
            targetUser.setActive(
                false
            );

            targetUser
                .incrementTokenVersion();
        }

        userRepository.save(
            targetUser
        );
    }

    private User validateCurrentUser() {

        User currentUser =
            currentUserService
                .getCurrentUser();

        if (
            currentUser.getRole()
                != Role.SUPER_ADMIN
        ) {
            throw new BusinessException(
                "Apenas administradores da plataforma podem acessar este recurso."
            );
        }

        if (
            currentUser
                .getOrganization()
                != null
        ) {
            throw new BusinessException(
                "Usuário da plataforma não deve possuir organização vinculada."
            );
        }

        if (
            !Boolean.TRUE.equals(
                currentUser
                    .getActive()
            )
        ) {
            throw new BusinessException(
                "Usuário da plataforma inativo."
            );
        }

        return currentUser;
    }

    private User findPlatformUser(
            Long id
    ) {
        return userRepository
            .findByIdAndOrganizationIsNullAndRole(
                id,
                Role.SUPER_ADMIN
            )
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Usuário da plataforma não encontrado."
                    )
            );
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

    private PlatformUserResponse toResponse(
            User user
    ) {
        return new PlatformUserResponse(
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