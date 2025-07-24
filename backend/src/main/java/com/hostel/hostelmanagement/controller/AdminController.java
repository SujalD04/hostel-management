package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.RegisterDto;
import com.hostel.hostelmanagement.model.Role;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.service.AuthService;
import com.hostel.hostelmanagement.repository.UserRepository; // Inject this
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private AuthService authService;
    private final UserRepository userRepository;

    // POST /api/admin/users
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')") // This secures the endpoint
    public ResponseEntity<String> createUser(@RequestBody RegisterDto registerDto) {
        authService.createUser(registerDto);
        return new ResponseEntity<>("User created successfully!", HttpStatus.CREATED);
    }

    // GET /api/admin/users/all
    @GetMapping("/users/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // GET /api/admin/users?role=ELECTRICIAN
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam String role) {
        Role userRole = Role.valueOf(role.toUpperCase());
        return ResponseEntity.ok(userRepository.findByRole(userRole));
    }
}
