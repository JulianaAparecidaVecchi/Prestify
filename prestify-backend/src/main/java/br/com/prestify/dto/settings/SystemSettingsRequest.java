package br.com.prestify.dto.settings;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SystemSettingsRequest {

    @NotBlank(
        message = "O fuso horário é obrigatório."
    )
    @Size(
        max = 100,
        message = "O fuso horário deve ter no máximo 100 caracteres."
    )
    private String timezone;

    @NotBlank(
        message = "O formato de data é obrigatório."
    )
    @Size(
        max = 30,
        message = "O formato de data deve ter no máximo 30 caracteres."
    )
    private String dateFormat;

    @NotBlank(
        message = "O formato de hora é obrigatório."
    )
    @Size(
        max = 30,
        message = "O formato de hora deve ter no máximo 30 caracteres."
    )
    private String timeFormat;

    @NotBlank(
        message = "O primeiro dia da semana é obrigatório."
    )
    @Size(
        max = 20,
        message = "O primeiro dia da semana deve ter no máximo 20 caracteres."
    )
    private String weekStartsOn;

    @NotBlank(
        message = "A moeda é obrigatória."
    )
    @Size(
        min = 3,
        max = 3,
        message = "A moeda deve utilizar o código ISO de 3 caracteres."
    )
    private String currency;

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(
            String timezone
    ) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(
            String dateFormat
    ) {
        this.dateFormat = dateFormat;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(
            String timeFormat
    ) {
        this.timeFormat = timeFormat;
    }

    public String getWeekStartsOn() {
        return weekStartsOn;
    }

    public void setWeekStartsOn(
            String weekStartsOn
    ) {
        this.weekStartsOn = weekStartsOn;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(
            String currency
    ) {
        this.currency = currency;
    }
}