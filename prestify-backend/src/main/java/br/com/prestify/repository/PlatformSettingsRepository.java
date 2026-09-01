package br.com.prestify.repository;

import br.com.prestify.entity.PlatformSettings;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository
        extends JpaRepository<
            PlatformSettings,
            Long
        > {
}