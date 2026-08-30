package br.com.prestify.dto.dashboard;

import java.time.LocalDateTime;

public class RecentActivityResponse {

    private final String type;
    private final String title;
    private final String description;
    private final LocalDateTime dateTime;

    public RecentActivityResponse(
            String type,
            String title,
            String description,
            LocalDateTime dateTime
    ) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }
}