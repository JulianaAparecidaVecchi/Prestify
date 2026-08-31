package br.com.prestify.dto.platform;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PlatformOrganizationCreateRequest {

    @NotBlank(
        message =
            "Informe o nome da empresa."
    )
    @Size(
        max = 150,
        message =
            "O nome da empresa deve possuir no máximo 150 caracteres."
    )
    private String name;

    @Size(
        max = 30,
        message =
            "O documento deve possuir no máximo 30 caracteres."
    )
    private String document;

    @Email(
        message =
            "Informe um e-mail válido para a empresa."
    )
    @Size(
        max = 150,
        message =
            "O e-mail da empresa deve possuir no máximo 150 caracteres."
    )
    private String email;

    @Size(
        max = 30,
        message =
            "O telefone deve possuir no máximo 30 caracteres."
    )
    private String phone;

    @Size(
        max = 250,
        message =
            "O endereço deve possuir no máximo 250 caracteres."
    )
    private String address;

    @NotNull(
        message =
            "Informe o plano da empresa."
    )
    private PlanType plan;

    @NotNull(
        message =
            "Informe o ciclo de cobrança."
    )
    private BillingCycle billingCycle;

    @NotBlank(
        message =
            "Informe o nome do proprietário."
    )
    @Size(
        max = 120,
        message =
            "O nome do proprietário deve possuir no máximo 120 caracteres."
    )
    private String ownerName;

    @NotBlank(
        message =
            "Informe o e-mail do proprietário."
    )
    @Email(
        message =
            "Informe um e-mail válido para o proprietário."
    )
    @Size(
        max = 150,
        message =
            "O e-mail do proprietário deve possuir no máximo 150 caracteres."
    )
    private String ownerEmail;

    @NotBlank(
        message =
            "Informe a senha inicial do proprietário."
    )
    @Size(
        min = 8,
        message =
            "A senha inicial deve possuir pelo menos 8 caracteres."
    )
    private String ownerPassword;

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

    public PlanType getPlan() {
        return plan;
    }

    public void setPlan(
            PlanType plan
    ) {
        this.plan = plan;
    }

    public BillingCycle
        getBillingCycle() {

        return billingCycle;
    }

    public void setBillingCycle(
            BillingCycle billingCycle
    ) {
        this.billingCycle =
            billingCycle;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(
            String ownerName
    ) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(
            String ownerEmail
    ) {
        this.ownerEmail =
            ownerEmail;
    }

    public String getOwnerPassword() {
        return ownerPassword;
    }

    public void setOwnerPassword(
            String ownerPassword
    ) {
        this.ownerPassword =
            ownerPassword;
    }
}