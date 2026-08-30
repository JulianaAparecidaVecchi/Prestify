package br.com.prestify.repository;

import br.com.prestify.entity.Supplier;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository
        extends JpaRepository<Supplier, Long> {

    Optional<Supplier>
        findByIdAndOrganizationId(
            Long id,
            Long organizationId
        );

    boolean
        existsByOrganizationIdAndDocumentIgnoreCase(
            Long organizationId,
            String document
        );

    boolean
        existsByOrganizationIdAndDocumentIgnoreCaseAndIdNot(
            Long organizationId,
            String document,
            Long id
        );

    @Query("""
        SELECT s
        FROM Supplier s
        WHERE s.organization.id = :organizationId
        AND (
            :search IS NULL
            OR LOWER(s.name)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.document)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.email)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.phone)
                LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :active IS NULL
            OR s.active = :active
        )
        """)
    Page<Supplier> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );
}