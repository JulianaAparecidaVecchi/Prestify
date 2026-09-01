package br.com.prestify.dto.platform.settings;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PlatformSettingsRequest {

    @NotBlank(
        message =
            "O nome da plataforma é obrigatório."
    )
    @Size(
        max = 120,
        message =
            "O nome da plataforma deve possuir no máximo 120 caracteres."
    )
    private String platformName;

    @Email(
        message =
            "Informe um e-mail de suporte válido."
    )
    @Size(
        max = 150,
        message =
            "O e-mail de suporte deve possuir no máximo 150 caracteres."
    )
    private String supportEmail;

    @Size(
        max = 30,
        message =
            "O telefone de suporte deve possuir no máximo 30 caracteres."
    )
    private String supportPhone;

    @Size(
        max = 250,
        message =
            "A URL do site deve possuir no máximo 250 caracteres."
    )
    private String websiteUrl;

    @NotBlank(
        message =
            "O fuso horário padrão é obrigatório."
    )
    @Size(
        max = 100,
        message =
            "O fuso horário deve possuir no máximo 100 caracteres."
    )
    private String defaultTimezone;

    @NotBlank(
        message =
            "A moeda padrão é obrigatória."
    )
    @Size(
        min = 3,
        max = 3,
        message =
            "A moeda deve possuir exatamente 3 caracteres."
    )
    private String defaultCurrency;

    @NotNull(
        message =
            "Informe se novos cadastros de empresas são permitidos."
    )
    private Boolean
        allowOrganizationRegistration;

    @NotNull(
        message =
            "Informe o estado do modo de manutenção."
    )
    private Boolean maintenanceMode;

    public PlatformSettingsRequest() {
    }

    public String getPlatformName() {
        return platformName;
    }

    public void setPlatformName(
            String platformName
    ) {
        this.platformName =
            platformName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(
            String supportEmail
    ) {
        this.supportEmail =
            supportEmail;
    }

    public String getSupportPhone() {
        return supportPhone;
    }

    public void setSupportPhone(
            String supportPhone
    ) {
        this.supportPhone =
            supportPhone;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(
            String websiteUrl
    ) {
        this.websiteUrl =
            websiteUrl;
    }

    public String getDefaultTimezone() {
        return defaultTimezone;
    }

    public void setDefaultTimezone(
            String defaultTimezone
    ) {
        this.defaultTimezone =
            defaultTimezone;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(
            String defaultCurrency
    ) {
        this.defaultCurrency =
            defaultCurrency;
    }

    public Boolean
        getAllowOrganizationRegistration() {

        return allowOrganizationRegistration;
    }

    public void
        setAllowOrganizationRegistration(
            Boolean allowOrganizationRegistration
        ) {

        this.allowOrganizationRegistration =
            allowOrganizationRegistration;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(
            Boolean maintenanceMode
    ) {
        this.maintenanceMode =
            maintenanceMode;
    }
}