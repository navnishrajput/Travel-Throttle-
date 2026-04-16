package com.travelthrottle.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI travelThrottleOpenAPI() {
        Server devServer = new Server()
                .url("http://localhost:" + serverPort + "/api")
                .description("Development Server");

        Contact contact = new Contact()
                .name("Travel Throttle Team")
                .email("support@travelthrottle.com")
                .url("https://travelthrottle.com");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("🏍️ Travel Throttle API")
                .version("1.0.0")
                .description("""
                        Travel Throttle - Bike Ride Sharing Platform API
                        
                        ## Features
                        - User authentication with JWT
                        - Create and join rides
                        - Real-time chat with WebSocket
                        - Bike management
                        - Reviews and ratings
                        - Notifications
                        
                        ## Authentication
                        Most endpoints require JWT authentication.
                        Use the `/api/auth/login` endpoint to get a token.
                        """)
                .contact(contact)
                .license(license);

        SecurityScheme securityScheme = new SecurityScheme()
                .name("Bearer Authentication")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Enter your JWT token");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("Bearer Authentication");

        return new OpenAPI()
                .servers(List.of(devServer))
                .info(info)
                .components(new Components().addSecuritySchemes("Bearer Authentication", securityScheme))
                .addSecurityItem(securityRequirement);
    }
}