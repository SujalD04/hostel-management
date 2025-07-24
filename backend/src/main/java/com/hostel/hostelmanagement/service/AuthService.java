package com.hostel.hostelmanagement.service;


import com.hostel.hostelmanagement.dto.RegisterDto;
import com.hostel.hostelmanagement.model.User;

public interface AuthService {
    User registerStudent(RegisterDto registerDto);
    User createUser(RegisterDto registerDto); // For admin to create any user
}
