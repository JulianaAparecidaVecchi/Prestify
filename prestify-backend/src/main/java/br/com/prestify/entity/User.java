package br.com.prestify.entity;

import br.com.prestify.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

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

    @Column(
        name = "token_version",
        nullable = false
    )
    private Long tokenVersion = 0L;

    /*
     * SUPER_ADMIN não pertence a uma empresa.
     *
     * OWNER, ADMIN, MANAGER e EMPLOYEE devem
     * possuir organização. Essa regra será
     * garantida na camada de serviço.
     */
    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = true
    )
    @JoinColumn(
        name = "organization_id",
        nullable = true
    )
    private Organization organization;

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;

    public User() {
    }

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
            LocalDateTime.now();

        if (active == null) {
            active = true;
        }

        if (tokenVersion == null) {
            tokenVersion = 0L;
        }

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {

        updatedAt =
            LocalDateTime.now();
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

        if (tokenVersion == null) {
            return 0L;
        }

        return tokenVersion;
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

    public Organization
        getOrganization() {

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

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}