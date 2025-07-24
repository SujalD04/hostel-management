package com.hostel.hostelmanagement.dto;

import com.hostel.hostelmanagement.model.Role;
import lombok.Data;

import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String fullName;
    private String email;
    private Role role;
}
