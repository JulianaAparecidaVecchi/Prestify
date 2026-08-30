package br.com.prestify.security;

import br.com.prestify.entity.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    @Value("${prestify.jwt.expiration}")
    private long expiration;

    public JwtService(
            JwtEncoder jwtEncoder
    ) {
        this.jwtEncoder =
            jwtEncoder;
    }

    public String generateToken(
            User user
    ) {

        Instant now =
            Instant.now();

        JwtClaimsSet claims =
            JwtClaimsSet
                .builder()

                .issuer(
                    "prestify"
                )

                .issuedAt(
                    now
                )

                .expiresAt(
                    now.plus(
                        expiration,
                        ChronoUnit.SECONDS
                    )
                )

                .subject(
                    user.getEmail()
                )

                .claim(
                    "userId",
                    user.getId()
                )

                .claim(
                    "role",
                    user
                        .getRole()
                        .name()
                )

                .claim(
                    "organizationId",
                    user
                        .getOrganization()
                        .getId()
                )

                /*
                 * Permite invalidar sessões
                 * anteriores sem manter uma
                 * blacklist de JWTs.
                 */
                .claim(
                    "tokenVersion",
                    user.getTokenVersion()
                )

                .build();

        return jwtEncoder
            .encode(
                JwtEncoderParameters
                    .from(claims)
            )
            .getTokenValue();
    }
}