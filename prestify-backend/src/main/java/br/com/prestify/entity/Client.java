package br.com.prestify.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "clients",
    indexes = {
        @Index(
            name = "idx_clients_organization",
            columnList = "organization_id"
        ),
        @Index(
            name = "idx_clients_name",
            columnList = "name"
        )
    }
)
public class Client {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        nullable = false,
        length = 150
    )
    private String name;

    @Column(
        length = 20
    )
    private String document;

    @Column(
        length = 150
    )
    private String email;

    @Column(
        nullable = false,
        length = 30
    )
    private String phone;

    private LocalDate birthDate;

    @Column(
        columnDefinition = "TEXT"
    )
    private String notes;

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
        nullable = false
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
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(
            LocalDate birthDate
    ) {
        this.birthDate = birthDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(
            Organization organization
    ) {
        this.organization = organization;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}