package br.com.prestify.entity;

import br.com.prestify.enums.Role;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        nullable = false,
        length = 120
    )
    private String name;

    @Column(
        nullable = false,
        unique = true,
        length = 150
    )
    private String email;

    @Column(
        nullable = false
    )
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 30
    )
    private Role role;

    @Column(
        nullable = false
    )
    private Boolean active = true;

    /*
     * Versão utilizada para invalidar
     * JWTs antigos.
     *
     * Mantemos nullable no banco inicialmente
     * para facilitar a migração dos usuários
     * que já existem.
     *
     * Valores null são tratados como 0.
     */
    @Column(
        name = "token_version"
    )
    private Long tokenVersion = 0L;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "organization_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_users_organization"
        )
    )
    private Organization organization;

    @Column(
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        nullable = false
    )
    private LocalDateTime updatedAt;

    public User() {
    }

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
            LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (active == null) {
            active = true;
        }

        if (tokenVersion == null) {
            tokenVersion = 0L;
        }
    }

    @PreUpdate
    public void preUpdate() {

        updatedAt =
            LocalDateTime.now();

        if (tokenVersion == null) {
            tokenVersion = 0L;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(
            Role role
    ) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }

    public Long getTokenVersion() {

        return tokenVersion == null
            ? 0L
            : tokenVersion;
    }

    public void setTokenVersion(
            Long tokenVersion
    ) {
        this.tokenVersion =
            tokenVersion;
    }

    public void incrementTokenVersion() {

        this.tokenVersion =
            getTokenVersion() + 1;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(
            Organization organization
    ) {
        this.organization =
            organization;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}