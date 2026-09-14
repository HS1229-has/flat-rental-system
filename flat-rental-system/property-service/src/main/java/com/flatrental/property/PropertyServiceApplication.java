package com.flatrental.property;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PropertyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PropertyServiceApplication.class, args);
    }
}
