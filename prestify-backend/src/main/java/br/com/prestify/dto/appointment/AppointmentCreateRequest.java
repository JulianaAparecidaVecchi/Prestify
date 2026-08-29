package br.com.prestify.dto.appointment;

import java.time.LocalDateTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AppointmentCreateRequest {

    @NotNull(
        message = "O cliente é obrigatório."
    )
    private Long clientId;

    @NotNull(
        message = "O serviço é obrigatório."
    )
    private Long serviceId;

    @NotNull(
        message = "O profissional é obrigatório."
    )
    private Long professionalId;

    @NotNull(
        message = "A data e horário são obrigatórios."
    )
    @FutureOrPresent(
        message = "O agendamento não pode ser criado no passado."
    )
    private LocalDateTime startTime;

    @Size(
        max = 2000,
        message = "As observações devem possuir no máximo 2000 caracteres."
    )
    private String notes;

    public AppointmentCreateRequest() {
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(
            Long clientId
    ) {
        this.clientId = clientId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(
            Long serviceId
    ) {
        this.serviceId = serviceId;
    }

    public Long getProfessionalId() {
        return professionalId;
    }

    public void setProfessionalId(
            Long professionalId
    ) {
        this.professionalId = professionalId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(
            LocalDateTime startTime
    ) {
        this.startTime = startTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }
}