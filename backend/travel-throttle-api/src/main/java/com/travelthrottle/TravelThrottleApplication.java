package com.travelthrottle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TravelThrottleApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelThrottleApplication.class, args);
        System.out.println("""

                ╔══════════════════════════════════════════════════════════╗
                ║                                                          ║
                ║   🏍️  Travel Throttle API Started Successfully!  🏍️    ║
                ║                                                          ║
                ║   API Documentation: http://localhost:8080/api/swagger-ui.html ║
                ║                                                          ║
                ╚══════════════════════════════════════════════════════════╝
                """);
    }
}