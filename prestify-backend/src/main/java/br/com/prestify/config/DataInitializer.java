package br.com.prestify.config;

import br.com.prestify.entity.Organization;
import br.com.prestify.entity.User;
import br.com.prestify.enums.Role;
import br.com.prestify.repository.OrganizationRepository;
import br.com.prestify.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            String adminEmail = "admin@prestify.com";

            if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
                return;
            }

            Organization organization =
                new Organization("Prestify Demo");

            organization =
                organizationRepository.save(organization);

            User owner = new User();

            owner.setName("Administrador");
            owner.setEmail(adminEmail);

            owner.setPassword(
                passwordEncoder.encode("Admin@123")
            );

            owner.setRole(Role.OWNER);
            owner.setActive(true);
            owner.setOrganization(organization);

            userRepository.save(owner);

            System.out.println(
                "Usuário OWNER inicial criado com sucesso."
            );
        };
    }
}