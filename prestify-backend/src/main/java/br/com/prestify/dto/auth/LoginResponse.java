package br.com.prestify.dto.auth;

public class LoginResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long organizationId;
    private String organizationName;

    public LoginResponse(
            String token,
            String tokenType,
            Long userId,
            String name,
            String email,
            String role,
            Long organizationId,
            String organizationName
    ) {
        this.token = token;
        this.tokenType = tokenType;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }
}