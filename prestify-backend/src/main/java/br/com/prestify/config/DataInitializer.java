package br.com.prestify.config;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;
import br.com.prestify.enums.Role;
import br.com.prestify.repository.OrganizationRepository;
import br.com.prestify.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.boot.CommandLineRunner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${prestify.initial-data.enabled:false}")
    private boolean initialDataEnabled;

    @Value("${prestify.initial-data.owner-name:Administrador}")
    private String ownerName;

    @Value("${prestify.initial-data.owner-email:}")
    private String ownerEmail;

    @Value("${prestify.initial-data.owner-password:}")
    private String ownerPassword;

    @Value("${prestify.initial-data.organization-name:Prestify Demo}")
    private String organizationName;

    @Bean
    public CommandLineRunner initializeData(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            /*
             * Em produção, a criação automática
             * do usuário inicial pode ser
             * completamente desativada.
             */
            if (!initialDataEnabled) {

                System.out.println(
                    "Inicialização automática de dados desativada."
                );

                return;
            }

            validateInitialConfiguration();

            String normalizedEmail =
                ownerEmail
                    .trim()
                    .toLowerCase();

            /*
             * Não recria o OWNER caso ele já
             * exista no banco.
             */
            if (
                userRepository
                    .existsByEmailIgnoreCase(
                        normalizedEmail
                    )
            ) {

                System.out.println(
                    "Usuário OWNER inicial já existe."
                );

                return;
            }

            Organization organization =
                new Organization(
                    organizationName.trim()
                );

            organization =
                organizationRepository.save(
                    organization
                );

            User owner =
                new User();

            owner.setName(
                ownerName.trim()
            );

            owner.setEmail(
                normalizedEmail
            );

            owner.setPassword(
                passwordEncoder.encode(
                    ownerPassword
                )
            );

            owner.setRole(
                Role.OWNER
            );

            owner.setActive(
                true
            );

            owner.setOrganization(
                organization
            );

            userRepository.save(
                owner
            );

            System.out.println(
                "Usuário OWNER inicial criado com sucesso."
            );
        };
    }

    private void validateInitialConfiguration() {

        if (
            ownerEmail == null
            || ownerEmail.isBlank()
        ) {

            throw new IllegalStateException(
                "PRESTIFY_INITIAL_OWNER_EMAIL deve ser informado quando a inicialização automática estiver habilitada."
            );
        }

        if (
            ownerPassword == null
            || ownerPassword.isBlank()
        ) {

            throw new IllegalStateException(
                "PRESTIFY_INITIAL_OWNER_PASSWORD deve ser informado quando a inicialização automática estiver habilitada."
            );
        }

        if (
            ownerPassword.length() < 8
        ) {

            throw new IllegalStateException(
                "A senha do OWNER inicial deve possuir pelo menos 8 caracteres."
            );
        }

        if (
            ownerName == null
            || ownerName.isBlank()
        ) {

            throw new IllegalStateException(
                "O nome do OWNER inicial deve ser informado."
            );
        }

        if (
            organizationName == null
            || organizationName.isBlank()
        ) {

            throw new IllegalStateException(
                "O nome da organização inicial deve ser informado."
            );
        }
    }
}