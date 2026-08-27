package br.com.prestify.entity;

import br.com.prestify.enums.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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