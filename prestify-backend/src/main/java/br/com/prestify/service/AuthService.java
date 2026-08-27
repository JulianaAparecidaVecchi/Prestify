package br.com.prestify.service;

import br.com.prestify.dto.auth.LoginRequest;
import br.com.prestify.dto.auth.LoginResponse;
import br.com.prestify.entity.User;
import br.com.prestify.exception.BusinessException;
import br.com.prestify.exception.InvalidCredentialsException;
import br.com.prestify.repository.UserRepository;
import br.com.prestify.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        String email = request
            .getEmail()
            .trim()
            .toLowerCase();

        User user = userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(
                () -> new InvalidCredentialsException(
                    "E-mail ou senha inválidos."
                )
            );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BusinessException(
                "Este usuário está desativado."
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException(
                "E-mail ou senha inválidos."
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
            token,
            "Bearer",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getOrganization().getId(),
            user.getOrganization().getName()
        );
    }
}