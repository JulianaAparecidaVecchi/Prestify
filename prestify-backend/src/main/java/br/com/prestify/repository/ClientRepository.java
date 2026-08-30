package br.com.prestify.repository;

import br.com.prestify.entity.Client;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository
        extends JpaRepository<Client, Long> {

    Optional<Client>
        findByIdAndOrganizationId(
            Long id,
            Long organizationId
        );

    boolean
        existsByDocumentAndOrganizationId(
            String document,
            Long organizationId
        );

    boolean
        existsByDocumentAndOrganizationIdAndIdNot(
            String document,
            Long organizationId,
            Long id
        );

    @Query("""
        SELECT c
        FROM Client c
        WHERE c.organization.id = :organizationId
        AND (
            LOWER(c.name)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(c.email, ''))
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(c.document, ''))
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.phone)
                LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :active IS NULL
            OR c.active = :active
        )
        """)
    Page<Client> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );

    long countByOrganizationIdAndActiveTrue(
        Long organizationId
    );
}