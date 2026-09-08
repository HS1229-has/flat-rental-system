package com.flatrental.auth.config;

import com.flatrental.auth.entity.Role;
import com.flatrental.auth.entity.User;
import com.flatrental.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Owner
            User owner = User.builder()
                    .username("owner")
                    .email("owner@luxeflats.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Luxe Owner")
                    .phoneNumber("9876543210")
                    .role(Role.ROLE_OWNER)
                    .build();
            userRepository.save(owner);

            // Seed Tenant
            User tenant = User.builder()
                    .username("tenant")
                    .email("tenant@luxeflats.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Luxe Tenant")
                    .phoneNumber("9876543211")
                    .role(Role.ROLE_TENANT)
                    .build();
            userRepository.save(tenant);

            // Seed Admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@luxeflats.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Luxe Admin")
                    .phoneNumber("9876543212")
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);

            System.out.println("Default users seeded: owner/password123, tenant/password123, admin/password123");
        }
    }
}
