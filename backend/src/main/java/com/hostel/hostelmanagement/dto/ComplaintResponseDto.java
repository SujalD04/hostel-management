package com.hostel.hostelmanagement.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ComplaintResponseDto {
    private UUID id;
    private String complaintType;
    private LocalDateTime createdAt;
    private String location;
    private String description;
    private String status;
    private String assignedToName; // Simplified, just return name instead of whole User
    private String studentName;    // If you want
}
