package br.com.prestify.dto.client;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClientResponse {

    private Long id;
    private String name;
    private String document;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClientResponse(
            Long id,
            String name,
            String document,
            String email,
            String phone,
            LocalDate birthDate,
            String notes,
            Boolean active,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.document = document;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
        this.notes = notes;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDocument() {
        return document;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getNotes() {
        return notes;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}