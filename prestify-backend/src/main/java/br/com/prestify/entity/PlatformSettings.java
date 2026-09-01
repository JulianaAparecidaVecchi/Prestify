package br.com.prestify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    @Id
    private Long id = 1L;

    @Column(
        name = "platform_name",
        nullable = false,
        length = 120
    )
    private String platformName =
        "Prestify";

    @Column(
        name = "support_email",
        length = 150
    )
    private String supportEmail;

    @Column(
        name = "support_phone",
        length = 30
    )
    private String supportPhone;

    @Column(
        name = "website_url",
        length = 250
    )
    private String websiteUrl;

    @Column(
        name = "default_timezone",
        nullable = false,
        length = 100
    )
    private String defaultTimezone =
        "America/Sao_Paulo";

    @Column(
        name = "default_currency",
        nullable = false,
        length = 3
    )
    private String defaultCurrency =
        "BRL";

    @Column(
        name = "allow_organization_registration",
        nullable = false
    )
    private Boolean
        allowOrganizationRegistration =
            true;

    @Column(
        name = "maintenance_mode",
        nullable = false
    )
    private Boolean maintenanceMode =
        false;

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;

    public PlatformSettings() {
    }

    @PrePersist
    public void prePersist() {

        applyDefaults();

        LocalDateTime now =
            LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {

        applyDefaults();

        updatedAt =
            LocalDateTime.now();
    }

    private void applyDefaults() {

        if (id == null) {
            id = 1L;
        }

        if (
            platformName == null
            || platformName.isBlank()
        ) {
            platformName =
                "Prestify";
        }

        if (
            defaultTimezone == null
            || defaultTimezone.isBlank()
        ) {
            defaultTimezone =
                "America/Sao_Paulo";
        }

        if (
            defaultCurrency == null
            || defaultCurrency.isBlank()
        ) {
            defaultCurrency =
                "BRL";
        }

        if (
            allowOrganizationRegistration
                == null
        ) {
            allowOrganizationRegistration =
                true;
        }

        if (
            maintenanceMode == null
        ) {
            maintenanceMode =
                false;
        }
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