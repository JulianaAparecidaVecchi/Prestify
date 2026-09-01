package br.com.prestify.dto.platform.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlatformUserCreateRequest {

    @NotBlank(
        message =
            "O nome é obrigatório."
    )
    @Size(
        max = 120,
        message =
            "O nome deve possuir no máximo 120 caracteres."
    )
    private String name;

    @NotBlank(
        message =
            "O e-mail é obrigatório."
    )
    @Email(
        message =
            "Informe um e-mail válido."
    )
    @Size(
        max = 150,
        message =
            "O e-mail deve possuir no máximo 150 caracteres."
    )
    private String email;

    @NotBlank(
        message =
            "A senha é obrigatória."
    )
    @Size(
        min = 8,
        message =
            "A senha deve possuir pelo menos 8 caracteres."
    )
    private String password;

    public PlatformUserCreateRequest() {
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
}