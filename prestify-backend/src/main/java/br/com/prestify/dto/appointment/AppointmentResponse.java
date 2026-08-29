package br.com.prestify.dto.appointment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long id;

    private Long clientId;
    private String clientName;

    private Long serviceId;
    private String serviceName;

    private Long professionalId;
    private String professionalName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer durationMinutes;
    private BigDecimal price;

    private String status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AppointmentResponse(
            Long id,
            Long clientId,
            String clientName,
            Long serviceId,
            String serviceName,
            Long professionalId,
            String professionalName,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer durationMinutes,
            BigDecimal price,
            String status,
            String notes,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.clientId = clientId;
        this.clientName = clientName;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.professionalId = professionalId;
        this.professionalName = professionalName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.price = price;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getClientId() {
        return clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public Long getProfessionalId() {
        return professionalId;
    }

    public String getProfessionalName() {
        return professionalName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}