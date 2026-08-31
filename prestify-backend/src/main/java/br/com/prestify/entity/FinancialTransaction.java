package br.com.prestify.entity;

import br.com.prestify.enums.FinancialSource;
import br.com.prestify.enums.FinancialStatus;
import br.com.prestify.enums.FinancialType;
import br.com.prestify.enums.PaymentMethod;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "financial_transactions",
    indexes = {
        @Index(
            name = "idx_financial_organization",
            columnList = "organization_id"
        ),
        @Index(
            name = "idx_financial_due_date",
            columnList = "due_date"
        ),
        @Index(
            name = "idx_financial_status",
            columnList = "status"
        ),
        @Index(
            name = "idx_financial_type",
            columnList = "type"
        ),
        @Index(
            name = "idx_financial_source",
            columnList = "source"
        )
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_financial_org_reference",
            columnNames = {
                "organization_id",
                "external_reference"
            }
        )
    }
)
public class FinancialTransaction {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        nullable = false,
        length = 180
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private FinancialType type;

    @Column(
        nullable = false,
        precision = 14,
        scale = 2
    )
    private BigDecimal amount;

    @Column(
        length = 100
    )
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private FinancialStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "payment_method",
        length = 30
    )
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "source",
        length = 30
    )
    private FinancialSource source;

    @Column(
        name = "external_reference",
        length = 180
    )
    private String externalReference;

    @Column(
        name = "due_date",
        nullable = false
    )
    private LocalDate dueDate;

    @Column(
        name = "payment_date"
    )
    private LocalDate paymentDate;

    @Column(
        columnDefinition = "TEXT"
    )
    private String notes;

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "supplier_id"
    )
    private Supplier supplier;

    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "client_id"
    )
    private Client client;

    /*
     * Lançamentos criados manualmente
     * possuem um usuário responsável.
     *
     * Lançamentos automáticos da
     * plataforma, como assinatura,
     * não precisam de usuário.
     */
    @ManyToOne(
        fetch = FetchType.LAZY
    )
    @JoinColumn(
        name = "created_by_user_id"
    )
    private User createdBy;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "organization_id",
        nullable = false
    )
    private Organization organization;

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

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
            LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {

            status =
                FinancialStatus.PENDING;
        }

        if (source == null) {

            source =
                FinancialSource.MANUAL;
        }
    }

    @PreUpdate
    public void preUpdate() {

        updatedAt =
            LocalDateTime.now();
    }

    public Long getId() {

        return id;
    }

    public String getDescription() {

        return description;
    }

    public void setDescription(
            String description
    ) {

        this.description =
            description;
    }

    public FinancialType getType() {

        return type;
    }

    public void setType(
            FinancialType type
    ) {

        this.type = type;
    }

    public BigDecimal getAmount() {

        return amount;
    }

    public void setAmount(
            BigDecimal amount
    ) {

        this.amount = amount;
    }

    public String getCategory() {

        return category;
    }

    public void setCategory(
            String category
    ) {

        this.category =
            category;
    }

    public FinancialStatus getStatus() {

        return status;
    }

    public void setStatus(
            FinancialStatus status
    ) {

        this.status = status;
    }

    public PaymentMethod getPaymentMethod() {

        return paymentMethod;
    }

    public void setPaymentMethod(
            PaymentMethod paymentMethod
    ) {

        this.paymentMethod =
            paymentMethod;
    }

    public FinancialSource getSource() {

        if (source == null) {

            return FinancialSource.MANUAL;
        }

        return source;
    }

    public void setSource(
            FinancialSource source
    ) {

        this.source = source;
    }

    public String getExternalReference() {

        return externalReference;
    }

    public void setExternalReference(
            String externalReference
    ) {

        this.externalReference =
            externalReference;
    }

    public LocalDate getDueDate() {

        return dueDate;
    }

    public void setDueDate(
            LocalDate dueDate
    ) {

        this.dueDate = dueDate;
    }

    public LocalDate getPaymentDate() {

        return paymentDate;
    }

    public void setPaymentDate(
            LocalDate paymentDate
    ) {

        this.paymentDate =
            paymentDate;
    }

    public String getNotes() {

        return notes;
    }

    public void setNotes(
            String notes
    ) {

        this.notes = notes;
    }

    public Supplier getSupplier() {

        return supplier;
    }

    public void setSupplier(
            Supplier supplier
    ) {

        this.supplier = supplier;
    }

    public Client getClient() {

        return client;
    }

    public void setClient(
            Client client
    ) {

        this.client = client;
    }

    public User getCreatedBy() {

        return createdBy;
    }

    public void setCreatedBy(
            User createdBy
    ) {

        this.createdBy =
            createdBy;
    }

    public Organization getOrganization() {

        return organization;
    }

    public void setOrganization(
            Organization organization
    ) {

        this.organization =
            organization;
    }

    public LocalDateTime getCreatedAt() {

        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }
}