package com.hostel.hostelmanagement.config;

import com.hostel.hostelmanagement.model.Role;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@AllArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // ✅ Always use the *instance* of userRepository, not the class name
        if (userRepository.findByEmail("admin@college.edu").isEmpty()) {
            User adminUser = new User();
            adminUser.setFullName("Admin User");
            adminUser.setEmail("admin@college.edu");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.ADMIN);
            adminUser.setCreatedAt(LocalDateTime.now()); // Add this if you have createdAt
            userRepository.save(adminUser);
            System.out.println(">>> Default admin user created!");
        } else {
            System.out.println(">>> Admin user already exists, skipping creation.");
        }
    }

}
