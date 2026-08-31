package br.com.prestify.service;

import br.com.prestify.dto.auth.AuthMessageResponse;
import br.com.prestify.dto.auth.AuthSessionResponse;
import br.com.prestify.dto.auth.ForgotPasswordRequest;
import br.com.prestify.dto.auth.LoginRequest;
import br.com.prestify.dto.auth.LoginResponse;
import br.com.prestify.dto.auth.ResetPasswordRequest;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.PasswordResetToken;
import br.com.prestify.entity.User;

import br.com.prestify.enums.Role;
import br.com.prestify.enums.SystemModule;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.InvalidCredentialsException;

import br.com.prestify.repository.PasswordResetTokenRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.rules.PlanRules;

import br.com.prestify.security.JwtService;

import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.core.Authentication;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger =
        LoggerFactory.getLogger(
            AuthService.class
        );

    private final UserRepository
        userRepository;

    private final PasswordResetTokenRepository
        passwordResetTokenRepository;

    private final PasswordEncoder
        passwordEncoder;

    private final JwtService
        jwtService;

    @Value(
        "${prestify.auth.log-reset-token:false}"
    )
    private boolean logResetToken;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {

        this.userRepository =
            userRepository;

        this.passwordResetTokenRepository =
            passwordResetTokenRepository;

        this.passwordEncoder =
            passwordEncoder;

        this.jwtService =
            jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(
            LoginRequest request
    ) {

        String email =
            request
                .getEmail()
                .trim()
                .toLowerCase();

        User user =
            userRepository
                .findByEmailIgnoreCase(
                    email
                )
                .orElseThrow(
                    () ->
                        new InvalidCredentialsException(
                            "E-mail ou senha inválidos."
                        )
                );

        if (
            !passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
            )
        ) {

            throw new InvalidCredentialsException(
                "E-mail ou senha inválidos."
            );
        }

        validateAuthenticatedUser(
            user
        );

        Organization organization =
            user.getOrganization();

        String token =
            jwtService.generateToken(
                user
            );

        Long organizationId =
            organization != null
                ? organization.getId()
                : null;

        String organizationName =
            organization != null
                ? organization.getName()
                : null;

        Set<SystemModule>
            enabledModules =
                getCurrentEnabledModules(
                    user
                );

        return new LoginResponse(
            token,
            "Bearer",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            organizationId,
            organizationName,
            enabledModules
        );
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse
        getCurrentSession(
            Authentication authentication
        ) {

        if (
            authentication == null
            ||
            !authentication
                .isAuthenticated()
            ||
            authentication
                .getName()
                == null
        ) {

            throw new BusinessException(
                "Usuário não autenticado."
            );
        }

        String email =
            authentication
                .getName()
                .trim()
                .toLowerCase();

        User user =
            userRepository
                .findByEmailIgnoreCase(
                    email
                )
                .orElseThrow(
                    () ->
                        new BusinessException(
                            "Usuário autenticado não encontrado."
                        )
                );

        validateAuthenticatedUser(
            user
        );

        Organization organization =
            user.getOrganization();

        Long organizationId =
            organization != null
                ? organization.getId()
                : null;

        String organizationName =
            organization != null
                ? organization.getName()
                : null;

        Set<SystemModule>
            enabledModules =
                getCurrentEnabledModules(
                    user
                );

        return new AuthSessionResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            organizationId,
            organizationName,
            enabledModules
        );
    }

    @Transactional
    public AuthMessageResponse
        forgotPassword(
            ForgotPasswordRequest request
        ) {

        String email =
            request
                .getEmail()
                .trim()
                .toLowerCase();

        Optional<User> optionalUser =
            userRepository
                .findByEmailIgnoreCase(
                    email
                );

        if (
            optionalUser.isEmpty()
        ) {

            return genericRecoveryResponse();
        }

        User user =
            optionalUser.get();

        if (
            !isUserEligibleForRecovery(
                user
            )
        ) {

            return genericRecoveryResponse();
        }

        passwordResetTokenRepository
            .deleteByUserId(
                user.getId()
            );

        String token =
            UUID
                .randomUUID()
                .toString();

        LocalDateTime expiresAt =
            LocalDateTime
                .now()
                .plusMinutes(30);

        PasswordResetToken resetToken =
            new PasswordResetToken(
                token,
                user,
                expiresAt
            );

        passwordResetTokenRepository
            .save(
                resetToken
            );

        if (
            logResetToken
        ) {

            logger.info(
                "PASSWORD RESET TOKEN (DEV) para {}: {}",
                user.getEmail(),
                token
            );
        }

        return genericRecoveryResponse();
    }

    @Transactional
    public AuthMessageResponse
        resetPassword(
            ResetPasswordRequest request
        ) {

        if (
            !request
                .getNewPassword()
                .equals(
                    request
                        .getConfirmPassword()
                )
        ) {

            throw new BusinessException(
                "A nova senha e a confirmação não coincidem."
            );
        }

        PasswordResetToken resetToken =
            passwordResetTokenRepository
                .findByTokenAndUsedFalse(
                    request
                        .getToken()
                        .trim()
                )
                .orElseThrow(
                    () ->
                        new BusinessException(
                            "Token de recuperação inválido."
                        )
                );

        if (
            resetToken
                .getExpiresAt()
                .isBefore(
                    LocalDateTime.now()
                )
        ) {

            resetToken.setUsed(
                true
            );

            passwordResetTokenRepository
                .save(
                    resetToken
                );

            throw new BusinessException(
                "O token de recuperação expirou."
            );
        }

        User user =
            resetToken.getUser();

        if (
            !isUserEligibleForRecovery(
                user
            )
        ) {

            throw new BusinessException(
                "Não foi possível redefinir a senha."
            );
        }

        if (
            passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
            )
        ) {

            throw new BusinessException(
                "A nova senha deve ser diferente da senha atual."
            );
        }

        user.setPassword(
            passwordEncoder.encode(
                request
                    .getNewPassword()
            )
        );

        user.incrementTokenVersion();

        userRepository.save(
            user
        );

        resetToken.setUsed(
            true
        );

        passwordResetTokenRepository
            .save(
                resetToken
            );

        return new AuthMessageResponse(
            "Senha redefinida com sucesso."
        );
    }

    private void
        validateAuthenticatedUser(
            User user
        ) {

        if (
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            throw new BusinessException(
                "Este usuário está desativado."
            );
        }

        Organization organization =
            user.getOrganization();

        if (
            user.getRole()
                == Role.SUPER_ADMIN
        ) {

            if (
                organization != null
            ) {

                throw new BusinessException(
                    "A configuração desta conta é inválida."
                );
            }

            return;
        }

        if (
            organization == null
        ) {

            throw new BusinessException(
                "O usuário não possui uma organização válida."
            );
        }

        if (
            !Boolean.TRUE.equals(
                organization.getActive()
            )
        ) {

            throw new BusinessException(
                "A empresa vinculada a esta conta está desativada."
            );
        }
    }

    private Set<SystemModule>
        getCurrentEnabledModules(
            User user
        ) {

        Set<SystemModule>
            enabledModules =
                new HashSet<>();

        Organization organization =
            user.getOrganization();

        /*
         * SUPER_ADMIN não possui
         * módulos operacionais.
         */
        if (
            organization == null
        ) {

            return enabledModules;
        }

        /*
         * Retornamos somente a
         * interseção entre os módulos
         * habilitados pela empresa e
         * os módulos permitidos pelo
         * plano atual.
         *
         * Portanto, mesmo que exista
         * algum dado legado incorreto,
         * o frontend nunca receberá
         * módulos fora do plano.
         */
        enabledModules.addAll(
            PlanRules
                .normalizeModules(
                    organization.getPlan(),
                    organization
                        .getEnabledModules()
                )
        );

        return enabledModules;
    }

    private boolean
        isUserEligibleForRecovery(
            User user
        ) {

        if (
            user == null
            ||
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            return false;
        }

        Organization organization =
            user.getOrganization();

        if (
            user.getRole()
                == Role.SUPER_ADMIN
        ) {

            return organization
                == null;
        }

        if (
            organization == null
        ) {

            return false;
        }

        return Boolean.TRUE.equals(
            organization.getActive()
        );
    }

    private AuthMessageResponse
        genericRecoveryResponse() {

        return new AuthMessageResponse(
            "Se o e-mail estiver cadastrado, as instruções de recuperação serão enviadas."
        );
    }
}