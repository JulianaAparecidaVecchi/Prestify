package br.com.prestify.repository;

import br.com.prestify.entity.StockMovement;
import br.com.prestify.enums.StockMovementType;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    @Query("""
        SELECT m
        FROM StockMovement m
        WHERE m.organization.id = :organizationId
        AND (
            :productId IS NULL
            OR m.product.id = :productId
        )
        AND (
            :type IS NULL
            OR m.type = :type
        )
        AND (
            :start IS NULL
            OR m.createdAt >= :start
        )
        AND (
            :end IS NULL
            OR m.createdAt < :end
        )
        """)
    Page<StockMovement> search(
        @Param("organizationId")
        Long organizationId,

        @Param("productId")
        Long productId,

        @Param("type")
        StockMovementType type,

        @Param("start")
        LocalDateTime start,

        @Param("end")
        LocalDateTime end,

        Pageable pageable
    );
}