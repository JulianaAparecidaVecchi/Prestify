package br.com.prestify.repository;

import br.com.prestify.entity.PasswordResetToken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken>
        findByTokenAndUsedFalse(
            String token
        );

    void deleteByUserId(
        Long userId
    );
}