package br.com.prestify.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(
        message = "O token é obrigatório."
    )
    private String token;

    @NotBlank(
        message = "A nova senha é obrigatória."
    )
    @Size(
        min = 8,
        max = 100,
        message = "A senha deve possuir entre 8 e 100 caracteres."
    )
    private String newPassword;

    @NotBlank(
        message = "A confirmação da senha é obrigatória."
    )
    private String confirmPassword;

    public String getToken() {
        return token;
    }

    public void setToken(
            String token
    ) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(
            String newPassword
    ) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(
            String confirmPassword
    ) {
        this.confirmPassword = confirmPassword;
    }
}