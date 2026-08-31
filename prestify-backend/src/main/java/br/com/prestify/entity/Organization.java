package br.com.prestify.entity;

import br.com.prestify.enums.BillingCycle;
import br.com.prestify.enums.PlanType;
import br.com.prestify.enums.SubscriptionStatus;
import br.com.prestify.enums.SystemModule;

import br.com.prestify.rules.PlanRules;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "organizations")
public class Organization {

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
        length = 30,
        unique = true
    )
    private String document;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 250)
    private String address;

    @Column(
        nullable = false
    )
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 30
    )
    private PlanType plan =
        PlanType.BASIC;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "billing_cycle",
        nullable = false,
        length = 20
    )
    private BillingCycle billingCycle =
        BillingCycle.MONTHLY;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "subscription_status",
        nullable = false,
        length = 30
    )
    private SubscriptionStatus
        subscriptionStatus =
            SubscriptionStatus.ACTIVE;

    @Column(
        name = "subscription_start_date"
    )
    private LocalDate
        subscriptionStartDate;

    @Column(
        name = "next_billing_date"
    )
    private LocalDate
        nextBillingDate;

    /*
     * =========================
     * CONFIGURAÇÕES DO SISTEMA
     * =========================
     */

    @Column(
        name = "timezone",
        length = 100
    )
    private String timezone =
        "America/Sao_Paulo";

    @Column(
        name = "date_format",
        length = 30
    )
    private String dateFormat =
        "DD/MM/YYYY";

    @Column(
        name = "time_format",
        length = 30
    )
    private String timeFormat =
        "HH:mm";

    @Column(
        name = "week_starts_on",
        length = 20
    )
    private String weekStartsOn =
        "MONDAY";

    @Column(
        name = "currency",
        length = 3
    )
    private String currency =
        "BRL";

    @ElementCollection(
        fetch = FetchType.EAGER
    )
    @CollectionTable(
        name = "organization_modules",
        joinColumns =
            @JoinColumn(
                name = "organization_id"
            )
    )
    @Enumerated(EnumType.STRING)
    @Column(
        name = "module",
        nullable = false,
        length = 50
    )
    private Set<SystemModule>
        enabledModules =
            new HashSet<>();

    public Organization() {

        enableDefaultModules();
    }

    public Organization(
            String name
    ) {

        this.name = name;

        enableDefaultModules();
    }

    @PrePersist
    public void prePersist() {

        applyDefaults();

        normalizeEnabledModules();
    }

    @PreUpdate
    public void preUpdate() {

        applyDefaults();

        normalizeEnabledModules();
    }

    private void applyDefaults() {

        if (active == null) {

            active = true;
        }

        if (plan == null) {

            plan =
                PlanType.BASIC;
        }

        if (
            billingCycle == null
        ) {

            billingCycle =
                BillingCycle.MONTHLY;
        }

        if (
            subscriptionStatus
                == null
        ) {

            subscriptionStatus =
                SubscriptionStatus.ACTIVE;
        }

        if (
            subscriptionStartDate
                == null
        ) {

            subscriptionStartDate =
                LocalDate.now();
        }

        if (
            nextBillingDate
                == null
        ) {

            nextBillingDate =
                calculateNextBillingDate(
                    subscriptionStartDate,
                    billingCycle
                );
        }

        if (
            timezone == null
        ) {

            timezone =
                "America/Sao_Paulo";
        }

        if (
            dateFormat == null
        ) {

            dateFormat =
                "DD/MM/YYYY";
        }

        if (
            timeFormat == null
        ) {

            timeFormat =
                "HH:mm";
        }

        if (
            weekStartsOn == null
        ) {

            weekStartsOn =
                "MONDAY";
        }

        if (
            currency == null
        ) {

            currency =
                "BRL";
        }

        if (
            enabledModules == null
        ) {

            enabledModules =
                new HashSet<>();
        }
    }

    /*
     * IMPORTANTE:
     *
     * Não substituímos mais o Set
     * quando a entidade já está sendo
     * gerenciada pelo Hibernate.
     *
     * Usamos clear() + addAll() para
     * preservar a coleção gerenciada
     * pelo JPA.
     */
    private void
        enableDefaultModules() {

        if (
            enabledModules == null
        ) {

            enabledModules =
                new HashSet<>();
        }

        Set<SystemModule>
            defaultModules =
                PlanRules
                    .getDefaultModules(
                        plan
                    );

        enabledModules.clear();

        enabledModules.addAll(
            defaultModules
        );
    }

    private void
        normalizeEnabledModules() {

        if (
            enabledModules == null
        ) {

            enabledModules =
                new HashSet<>();
        }

        Set<SystemModule>
            normalizedModules =
                PlanRules
                    .normalizeModules(
                        plan,
                        enabledModules
                    );

        enabledModules.clear();

        enabledModules.addAll(
            normalizedModules
        );
    }

    private LocalDate
        calculateNextBillingDate(
            LocalDate startDate,
            BillingCycle cycle
        ) {

        if (
            cycle
                == BillingCycle.YEARLY
        ) {

            return startDate
                .plusYears(1);
        }

        return startDate
            .plusMonths(1);
    }

    public Long getId() {

        return id;
    }

    public void setId(
            Long id
    ) {

        this.id = id;
    }

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

        this.document =
            document;
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

        this.address =
            address;
    }

    public Boolean getActive() {

        return active;
    }

    public void setActive(
            Boolean active
    ) {

        this.active = active;
    }

    public PlanType getPlan() {

        return plan;
    }

    public void setPlan(
            PlanType plan
    ) {

        this.plan =
            plan == null
                ? PlanType.BASIC
                : plan;

        /*
         * Remove somente módulos que
         * deixaram de ser permitidos
         * pelo novo plano.
         *
         * Não substitui a coleção
         * gerenciada pelo Hibernate.
         */
        normalizeEnabledModules();
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

    public SubscriptionStatus
        getSubscriptionStatus() {

        return subscriptionStatus;
    }

    public void setSubscriptionStatus(
            SubscriptionStatus subscriptionStatus
    ) {

        this.subscriptionStatus =
            subscriptionStatus;
    }

    public LocalDate
        getSubscriptionStartDate() {

        return subscriptionStartDate;
    }

    public void
        setSubscriptionStartDate(
            LocalDate subscriptionStartDate
        ) {

        this.subscriptionStartDate =
            subscriptionStartDate;
    }

    public LocalDate
        getNextBillingDate() {

        return nextBillingDate;
    }

    public void setNextBillingDate(
            LocalDate nextBillingDate
    ) {

        this.nextBillingDate =
            nextBillingDate;
    }

    public String getTimezone() {

        return timezone;
    }

    public void setTimezone(
            String timezone
    ) {

        this.timezone =
            timezone;
    }

    public String getDateFormat() {

        return dateFormat;
    }

    public void setDateFormat(
            String dateFormat
    ) {

        this.dateFormat =
            dateFormat;
    }

    public String getTimeFormat() {

        return timeFormat;
    }

    public void setTimeFormat(
            String timeFormat
    ) {

        this.timeFormat =
            timeFormat;
    }

    public String getWeekStartsOn() {

        return weekStartsOn;
    }

    public void setWeekStartsOn(
            String weekStartsOn
    ) {

        this.weekStartsOn =
            weekStartsOn;
    }

    public String getCurrency() {

        return currency;
    }

    public void setCurrency(
            String currency
    ) {

        this.currency =
            currency;
    }

    public Set<SystemModule>
        getEnabledModules() {

        return enabledModules;
    }

    public void setEnabledModules(
            Set<SystemModule> modules
    ) {

        if (
            enabledModules == null
        ) {

            enabledModules =
                new HashSet<>();
        }

        /*
         * Primeiro calculamos a nova
         * lista sem alterar a coleção.
         */
        Set<SystemModule>
            normalizedModules =
                PlanRules
                    .normalizeModules(
                        plan,
                        modules
                    );

        /*
         * Depois modificamos a coleção
         * existente.
         *
         * Isso permite ao Hibernate
         * detectar corretamente as
         * remoções e inserções na tabela
         * organization_modules.
         */
        enabledModules.clear();

        enabledModules.addAll(
            normalizedModules
        );
    }
}