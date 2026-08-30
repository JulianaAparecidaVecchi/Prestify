package br.com.prestify.dto.settings;

public class SystemSettingsResponse {

    private final String timezone;
    private final String dateFormat;
    private final String timeFormat;
    private final String weekStartsOn;
    private final String currency;

    public SystemSettingsResponse(
            String timezone,
            String dateFormat,
            String timeFormat,
            String weekStartsOn,
            String currency
    ) {

        this.timezone = timezone;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.weekStartsOn = weekStartsOn;
        this.currency = currency;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public String getWeekStartsOn() {
        return weekStartsOn;
    }

    public String getCurrency() {
        return currency;
    }
}