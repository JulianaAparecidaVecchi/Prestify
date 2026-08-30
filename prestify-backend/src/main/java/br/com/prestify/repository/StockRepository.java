package br.com.prestify.repository;

import br.com.prestify.entity.Stock;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockRepository
        extends JpaRepository<Stock, Long> {

    Optional<Stock>
        findByProductIdAndOrganizationId(
            Long productId,
            Long organizationId
        );

    @Query("""
        SELECT s
        FROM Stock s
        WHERE s.organization.id = :organizationId
        AND (
            :search IS NULL
            OR LOWER(s.product.name)
                LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.product.sku)
                LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :active IS NULL
            OR s.product.active = :active
        )
        """)
    Page<Stock> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        @Param("active")
        Boolean active,

        Pageable pageable
    );
}