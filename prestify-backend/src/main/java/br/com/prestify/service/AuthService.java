package br.com.prestify.service;

import br.com.prestify.dto.auth.AuthMessageResponse;
import br.com.prestify.dto.auth.ForgotPasswordRequest;
import br.com.prestify.dto.auth.LoginRequest;
import br.com.prestify.dto.auth.LoginResponse;
import br.com.prestify.dto.auth.ResetPasswordRequest;

import br.com.prestify.entity.PasswordResetToken;
import br.com.prestify.entity.User;

import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.InvalidCredentialsException;

import br.com.prestify.repository.PasswordResetTokenRepository;
import br.com.prestify.repository.UserRepository;

import br.com.prestify.security.JwtService;

import java.time.LocalDateTime;

import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger =
        LoggerFactory.getLogger(
            AuthService.class
        );

    private final UserRepository userRepository;

    private final PasswordResetTokenRepository
        passwordResetTokenRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

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
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            throw new BusinessException(
                "Este usuário está desativado."
            );
        }

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

        String token =
            jwtService.generateToken(
                user
            );

        return new LoginResponse(
            token,
            "Bearer",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user
                .getOrganization()
                .getId(),
            user
                .getOrganization()
                .getName()
        );
    }

    @Transactional
    public AuthMessageResponse forgotPassword(
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

        /*
         * Evita enumeração de contas.
         */
        if (
            optionalUser.isEmpty()
        ) {

            return genericRecoveryResponse();
        }

        User user =
            optionalUser.get();

        /*
         * Também não revelamos externamente
         * que uma conta existe mas está inativa.
         */
        if (
            !Boolean.TRUE.equals(
                user.getActive()
            )
        ) {

            return genericRecoveryResponse();
        }

        /*
         * Apenas o token de recuperação mais
         * recente continua utilizável.
         */
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
            .save(resetToken);

        /*
         * SOMENTE DESENVOLVIMENTO.
         *
         * Em produção essa opção deve ficar
         * desabilitada e o token deve ser
         * enviado por e-mail.
         */
        if (logResetToken) {

            logger.info(
                "PASSWORD RESET TOKEN (DEV) para {}: {}",
                user.getEmail(),
                token
            );
        }

        return genericRecoveryResponse();
    }

    @Transactional
    public AuthMessageResponse resetPassword(
            ResetPasswordRequest request
    ) {

        if (
            !request
                .getNewPassword()
                .equals(
                    request.getConfirmPassword()
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
                .save(resetToken);

            throw new BusinessException(
                "O token de recuperação expirou."
            );
        }

        User user =
            resetToken.getUser();

        if (
            !Boolean.TRUE.equals(
                user.getActive()
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
                request.getNewPassword()
            )
        );

        /*
         * Invalida imediatamente todos
         * os JWTs emitidos anteriormente.
         */
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

    private AuthMessageResponse
        genericRecoveryResponse() {

        return new AuthMessageResponse(
            "Se o e-mail estiver cadastrado, as instruções de recuperação serão enviadas."
        );
    }
}