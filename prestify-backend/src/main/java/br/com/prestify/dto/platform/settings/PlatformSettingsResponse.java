package br.com.prestify.dto.platform.settings;

import java.time.LocalDateTime;

public class PlatformSettingsResponse {

    private Long id;

    private String platformName;

    private String supportEmail;

    private String supportPhone;

    private String websiteUrl;

    private String defaultTimezone;

    private String defaultCurrency;

    private Boolean
        allowOrganizationRegistration;

    private Boolean maintenanceMode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public PlatformSettingsResponse() {
    }

    public PlatformSettingsResponse(
            Long id,
            String platformName,
            String supportEmail,
            String supportPhone,
            String websiteUrl,
            String defaultTimezone,
            String defaultCurrency,
            Boolean allowOrganizationRegistration,
            Boolean maintenanceMode,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id = id;

        this.platformName =
            platformName;

        this.supportEmail =
            supportEmail;

        this.supportPhone =
            supportPhone;

        this.websiteUrl =
            websiteUrl;

        this.defaultTimezone =
            defaultTimezone;

        this.defaultCurrency =
            defaultCurrency;

        this.allowOrganizationRegistration =
            allowOrganizationRegistration;

        this.maintenanceMode =
            maintenanceMode;

        this.createdAt =
            createdAt;

        this.updatedAt =
            updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
            createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt =
            updatedAt;
    }
}