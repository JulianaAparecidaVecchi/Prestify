package br.com.prestify.repository;

import br.com.prestify.entity.User;
import br.com.prestify.enums.Role;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(
        String email
    );

    boolean existsByEmailIgnoreCase(
        String email
    );

    boolean existsByEmailIgnoreCaseAndIdNot(
        String email,
        Long id
    );

    Optional<User> findByIdAndOrganizationId(
        Long id,
        Long organizationId
    );

    long countByOrganizationIdAndRoleAndActiveTrue(
        Long organizationId,
        Role role
    );

    List<User> findByOrganizationIdAndActiveTrueOrderByNameAsc(
        Long organizationId
    );

    @Query("""
        SELECT u
        FROM User u
        WHERE u.organization.id = :organizationId
        AND (
            LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        """)
    Page<User> search(
        @Param("organizationId")
        Long organizationId,

        @Param("search")
        String search,

        Pageable pageable
    );
}