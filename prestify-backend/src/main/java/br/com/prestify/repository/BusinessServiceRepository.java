package br.com.prestify.repository;

import br.com.prestify.entity.BusinessService;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessServiceRepository
        extends JpaRepository<BusinessService, Long> {

    Optional<BusinessService>
        findByIdAndOrganizationId(
            Long id,
            Long organizationId
        );

    boolean
        existsByNameIgnoreCaseAndOrganizationId(
            String name,
            Long organizationId
        );

    boolean
        existsByNameIgnoreCaseAndOrganizationIdAndIdNot(
            String name,
            Long organizationId,
            Long id
        );

    @Query("""
        SELECT s
        FROM BusinessService s
        WHERE s.organization.id = :organizationId
        AND (
            LOWER(s.name)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(s.description, ''))
                LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :active IS NULL
            OR s.active = :active
        )
        """)
    Page<BusinessService> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );
}