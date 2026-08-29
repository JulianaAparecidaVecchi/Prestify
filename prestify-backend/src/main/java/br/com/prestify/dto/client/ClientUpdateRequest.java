package br.com.prestify.dto.client;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public class ClientUpdateRequest {

    @NotBlank(
        message = "O nome é obrigatório."
    )
    @Size(max = 150)
    private String name;

    @Size(max = 20)
    private String document;

    @Email(
        message = "Informe um e-mail válido."
    )
    @Size(max = 150)
    private String email;

    @NotBlank(
        message = "O telefone é obrigatório."
    )
    @Size(max = 30)
    private String phone;

    @PastOrPresent(
        message = "A data de nascimento não pode estar no futuro."
    )
    private LocalDate birthDate;

    private String notes;

    public ClientUpdateRequest() {
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

    public void setDocument(
            String document
    ) {
        this.document = document;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(
            String phone
    ) {
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

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }
}