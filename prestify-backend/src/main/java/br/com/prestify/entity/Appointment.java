package br.com.prestify.entity;

import br.com.prestify.enums.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "appointments",
    indexes = {
        @Index(
            name = "idx_appointments_organization",
            columnList = "organization_id"
        ),
        @Index(
            name = "idx_appointments_start",
            columnList = "start_time"
        ),
        @Index(
            name = "idx_appointments_professional",
            columnList = "professional_id"
        ),
        @Index(
            name = "idx_appointments_client",
            columnList = "client_id"
        )
    }
)
public class Appointment {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "client_id",
        nullable = false
    )
    private Client client;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "service_id",
        nullable = false
    )
    private BusinessService service;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "professional_id",
        nullable = false
    )
    private User professional;

    @Column(
        name = "start_time",
        nullable = false
    )
    private LocalDateTime startTime;

    @Column(
        name = "end_time",
        nullable = false
    )
    private LocalDateTime endTime;

    @Column(
        name = "duration_minutes",
        nullable = false
    )
    private Integer durationMinutes;

    @Column(
        name = "price",
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 30
    )
    private AppointmentStatus status;

    @Column(
        columnDefinition = "TEXT"
    )
    private String notes;

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
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
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
            status = AppointmentStatus.SCHEDULED;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(
            Client client
    ) {
        this.client = client;
    }

    public BusinessService getService() {
        return service;
    }

    public void setService(
            BusinessService service
    ) {
        this.service = service;
    }

    public User getProfessional() {
        return professional;
    }

    public void setProfessional(
            User professional
    ) {
        this.professional = professional;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(
            LocalDateTime startTime
    ) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(
            LocalDateTime endTime
    ) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(
            Integer durationMinutes
    ) {
        this.durationMinutes = durationMinutes;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(
            BigDecimal price
    ) {
        this.price = price;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(
            AppointmentStatus status
    ) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(
            Organization organization
    ) {
        this.organization = organization;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}