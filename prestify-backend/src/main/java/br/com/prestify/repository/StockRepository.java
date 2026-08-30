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

    /*
     * Consulta utilizada durante movimentações
     * de estoque.
     *
     * O FOR UPDATE é escrito diretamente porque
     * o ambiente local utiliza MariaDB 10.4.
     *
     * Enquanto a transação estiver aberta,
     * outra movimentação não poderá alterar
     * simultaneamente esta mesma linha.
     */
    @Query(
        value = """
            SELECT *
            FROM stocks
            WHERE product_id = :productId
            AND organization_id = :organizationId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Stock>
        findByProductIdAndOrganizationIdForUpdate(
            @Param("productId")
            Long productId,

            @Param("organizationId")
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

    @Query("""
        SELECT COUNT(s)
        FROM Stock s
        WHERE s.organization.id = :organizationId
        AND s.product.active = true
        AND s.quantity <= s.product.minimumStock
        """)
    long countLowStockProducts(
        @Param("organizationId")
        Long organizationId
    );
}