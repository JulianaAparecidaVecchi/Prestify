package br.com.prestify.config;

import br.com.prestify.security.JwtSessionValidationFilter;
import br.com.prestify.security.ModuleAccessFilter;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${prestify.jwt.secret}")
    private String jwtSecret;

    @Value("${prestify.cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtSessionValidationFilter
        jwtSessionValidationFilter;

    private final ModuleAccessFilter
        moduleAccessFilter;

    public SecurityConfig(
            JwtSessionValidationFilter jwtSessionValidationFilter,
            ModuleAccessFilter moduleAccessFilter
    ) {

        this.jwtSessionValidationFilter =
            jwtSessionValidationFilter;

        this.moduleAccessFilter =
            moduleAccessFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            /*
             * API REST autenticada por JWT.
             * Não utilizamos sessão HTTP.
             */
            .sessionManagement(
                session ->
                    session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                    )
            )

            .csrf(
                csrf ->
                    csrf.disable()
            )

            .cors(
                cors ->
                    cors.configurationSource(
                        corsConfigurationSource()
                    )
            )

            .authorizeHttpRequests(
                auth -> auth

                    /*
                     * Endpoints públicos necessários
                     * para autenticação e recuperação
                     * de senha.
                     */
                    .requestMatchers(
                        "/api/auth/**"
                    )
                    .permitAll()

                    /*
                     * Necessário para requisições
                     * CORS preflight.
                     */
                    .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                    )
                    .permitAll()

                    /*
                     * Todo o restante da API exige
                     * autenticação JWT.
                     */
                    .anyRequest()
                    .authenticated()
            )

            .formLogin(
                form ->
                    form.disable()
            )

            .httpBasic(
                basic ->
                    basic.disable()
            )

            .oauth2ResourceServer(
                oauth2 ->
                    oauth2.jwt(
                        jwt ->
                            jwt.jwtAuthenticationConverter(
                                jwtAuthenticationConverter()
                            )
                    )
            )

            /*
             * Ordem da segurança:
             *
             * BearerTokenAuthenticationFilter
             *      ↓
             * JwtSessionValidationFilter
             *      ↓
             * ModuleAccessFilter
             */
            .addFilterAfter(
                jwtSessionValidationFilter,
                BearerTokenAuthenticationFilter.class
            )

            .addFilterAfter(
                moduleAccessFilter,
                JwtSessionValidationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource
        corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();

        List<String> origins =
            Arrays
                .stream(
                    allowedOrigins.split(",")
                )
                .map(String::trim)
                .filter(
                    origin ->
                        !origin.isBlank()
                )
                .toList();

        configuration.setAllowedOrigins(
            origins
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT
            )
        );

        configuration.setExposedHeaders(
            List.of(
                HttpHeaders.CONTENT_DISPOSITION
            )
        );

        /*
         * O Prestify envia o JWT pelo header
         * Authorization e não depende de cookies
         * de sessão.
         */
        configuration.setAllowCredentials(
            false
        );

        configuration.setMaxAge(
            3600L
        );

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }

    @Bean
    public JwtAuthenticationConverter
        jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter
            authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter
            .setAuthoritiesClaimName(
                "role"
            );

        authoritiesConverter
            .setAuthorityPrefix(
                "ROLE_"
            );

        JwtAuthenticationConverter
            authenticationConverter =
                new JwtAuthenticationConverter();

        authenticationConverter
            .setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
            );

        return authenticationConverter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    private SecretKey secretKey() {

        return new SecretKeySpec(
            jwtSecret.getBytes(
                StandardCharsets.UTF_8
            ),
            "HmacSHA256"
        );
    }

    @Bean
    public JwtEncoder jwtEncoder() {

        return NimbusJwtEncoder
            .withSecretKey(
                secretKey()
            )
            .algorithm(
                MacAlgorithm.HS256
            )
            .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {

        NimbusJwtDecoder decoder =
            NimbusJwtDecoder
                .withSecretKey(
                    secretKey()
                )
                .macAlgorithm(
                    MacAlgorithm.HS256
                )
                .build();

        OAuth2TokenValidator<Jwt>
            timestampValidator =
                new JwtTimestampValidator();

        OAuth2TokenValidator<Jwt>
            issuerValidator =
                new JwtIssuerValidator(
                    "prestify"
                );

        decoder.setJwtValidator(
            new DelegatingOAuth2TokenValidator<>(
                timestampValidator,
                issuerValidator
            )
        );

        return decoder;
    }
}