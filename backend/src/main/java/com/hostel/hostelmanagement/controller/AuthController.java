package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.RegisterDto;
import com.hostel.hostelmanagement.dto.UserDto;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.service.AuthService;
import com.hostel.hostelmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<String> registerStudent(@RequestBody RegisterDto registerDto) {
        authService.registerStudent(registerDto);
        return new ResponseEntity<>("Student registered successfully!", HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());  // assuming your User entity uses `name`
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return ResponseEntity.ok(dto);
    }

}
