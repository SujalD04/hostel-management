package com.hostel.hostelmanagement.dto;

import com.hostel.hostelmanagement.model.Role;
import lombok.Data;

@Data
public class RegisterDto {
    private String fullName;
    private String email;
    private String password;
    private Role role; // The admin will use this to set a role
}
