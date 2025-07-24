package com.hostel.hostelmanagement.service.impl;

import com.hostel.hostelmanagement.dto.RegisterDto;
import com.hostel.hostelmanagement.model.Role;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.repository.UserRepository;
import com.hostel.hostelmanagement.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User registerStudent(RegisterDto registerDto) {
        return createUserInternal(registerDto, Role.STUDENT);
    }

    @Override
    public User createUser(RegisterDto registerDto) {
        return createUserInternal(registerDto, registerDto.getRole());
    }

    private User createUserInternal(RegisterDto registerDto, Role role) {
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email address already in use.");
        }

        User user = new User();
        user.setFullName(registerDto.getFullName());
        user.setEmail(registerDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerDto.getPassword()));
        user.setRole(role);

        return userRepository.save(user);
    }
}

