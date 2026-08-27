package br.com.prestify.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiError {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> fields;

    public ApiError(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path
    ) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public ApiError(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fields
    ) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.fields = fields;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getFields() {
        return fields;
    }
}