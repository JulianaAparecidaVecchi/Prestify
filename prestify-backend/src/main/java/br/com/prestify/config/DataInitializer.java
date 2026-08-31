package br.com.prestify.config;

import br.com.prestify.entity.User;
import br.com.prestify.enums.Role;
import br.com.prestify.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.boot.CommandLineRunner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value(
        "${prestify.initial-data.enabled:false}"
    )
    private boolean initialDataEnabled;

    @Value(
        "${prestify.initial-data.super-admin-name:Administrador Prestify}"
    )
    private String superAdminName;

    @Value(
        "${prestify.initial-data.super-admin-email:}"
    )
    private String superAdminEmail;

    @Value(
        "${prestify.initial-data.super-admin-password:}"
    )
    private String superAdminPassword;

    @Bean
    public CommandLineRunner initializeData(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (!initialDataEnabled) {

                System.out.println(
                    "Inicialização automática de dados desativada."
                );

                return;
            }

            validateInitialConfiguration();

            String normalizedEmail =
                superAdminEmail
                    .trim()
                    .toLowerCase();

            if (
                userRepository
                    .existsByEmailIgnoreCase(
                        normalizedEmail
                    )
            ) {

                System.out.println(
                    "SUPER_ADMIN inicial já existe."
                );

                return;
            }

            User superAdmin =
                new User();

            superAdmin.setName(
                superAdminName.trim()
            );

            superAdmin.setEmail(
                normalizedEmail
            );

            superAdmin.setPassword(
                passwordEncoder.encode(
                    superAdminPassword
                )
            );

            superAdmin.setRole(
                Role.SUPER_ADMIN
            );

            superAdmin.setActive(
                true
            );

            /*
             * Usuário da plataforma Prestify
             * não pertence a empresa cliente.
             */
            superAdmin.setOrganization(
                null
            );

            userRepository.save(
                superAdmin
            );

            System.out.println(
                "SUPER_ADMIN inicial criado com sucesso."
            );
        };
    }

    private void
        validateInitialConfiguration() {

        if (
            superAdminEmail == null
            || superAdminEmail.isBlank()
        ) {

            throw new IllegalStateException(
                "PRESTIFY_INITIAL_SUPER_ADMIN_EMAIL deve ser informado quando a inicialização automática estiver habilitada."
            );
        }

        if (
            superAdminPassword == null
            || superAdminPassword.isBlank()
        ) {

            throw new IllegalStateException(
                "PRESTIFY_INITIAL_SUPER_ADMIN_PASSWORD deve ser informado quando a inicialização automática estiver habilitada."
            );
        }

        if (
            superAdminPassword.length()
                < 8
        ) {

            throw new IllegalStateException(
                "A senha do SUPER_ADMIN inicial deve possuir pelo menos 8 caracteres."
            );
        }

        if (
            superAdminName == null
            || superAdminName.isBlank()
        ) {

            throw new IllegalStateException(
                "O nome do SUPER_ADMIN inicial deve ser informado."
            );
        }
    }
}