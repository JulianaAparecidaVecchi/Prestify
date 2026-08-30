package br.com.prestify.repository;

import br.com.prestify.entity.Product;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndOrganizationId(
        Long id,
        Long organizationId
    );

    boolean existsByOrganizationIdAndSkuIgnoreCase(
        Long organizationId,
        String sku
    );

    boolean existsByOrganizationIdAndSkuIgnoreCaseAndIdNot(
        Long organizationId,
        String sku,
        Long id
    );

    @Query("""
        SELECT p
        FROM Product p
        WHERE p.organization.id = :organizationId
        AND (
            :search IS NULL
            OR LOWER(p.name)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.sku)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(p.description, ''))
                LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :active IS NULL
            OR p.active = :active
        )
        """)
    Page<Product> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );
}