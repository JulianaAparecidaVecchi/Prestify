package br.com.prestify.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SupplierUpdateRequest {

    @NotBlank(
        message = "O nome do fornecedor é obrigatório."
    )
    @Size(
        max = 150,
        message = "O nome deve possuir no máximo 150 caracteres."
    )
    private String name;

    @Size(
        max = 30,
        message = "O documento deve possuir no máximo 30 caracteres."
    )
    private String document;

    @Email(
        message = "Informe um e-mail válido."
    )
    @Size(
        max = 150,
        message = "O e-mail deve possuir no máximo 150 caracteres."
    )
    private String email;

    @Size(
        max = 30,
        message = "O telefone deve possuir no máximo 30 caracteres."
    )
    private String phone;

    @Size(
        max = 250,
        message = "O endereço deve possuir no máximo 250 caracteres."
    )
    private String address;

    @Size(
        max = 2000,
        message = "As observações devem possuir no máximo 2000 caracteres."
    )
    private String notes;

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
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

    public String getAddress() {
        return address;
    }

    public void setAddress(
            String address
    ) {
        this.address = address;
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