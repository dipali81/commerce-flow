package com.commerceflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CommerceFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommerceFlowApplication.class, args);
    }
}
