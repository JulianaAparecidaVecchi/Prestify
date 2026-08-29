package br.com.prestify.dto.service;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceCreateRequest {

    @NotBlank(
        message = "O nome do serviço é obrigatório."
    )
    @Size(
        max = 150,
        message = "O nome deve possuir no máximo 150 caracteres."
    )
    private String name;

    @Size(
        max = 2000,
        message = "A descrição deve possuir no máximo 2000 caracteres."
    )
    private String description;

    @NotNull(
        message = "O preço é obrigatório."
    )
    @DecimalMin(
        value = "0.00",
        inclusive = true,
        message = "O preço não pode ser negativo."
    )
    private BigDecimal price;

    @NotNull(
        message = "A duração é obrigatória."
    )
    @Min(
        value = 1,
        message = "A duração deve ser de pelo menos 1 minuto."
    )
    @Max(
        value = 10080,
        message = "A duração não pode ultrapassar 10080 minutos."
    )
    private Integer durationMinutes;

    public ServiceCreateRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(
            BigDecimal price
    ) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(
            Integer durationMinutes
    ) {
        this.durationMinutes = durationMinutes;
    }
}