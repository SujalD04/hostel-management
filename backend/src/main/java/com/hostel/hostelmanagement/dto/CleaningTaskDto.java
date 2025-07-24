package com.hostel.hostelmanagement.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CleaningTaskDto(
        UUID id,
        String complaintType,
        String description,
        String location,
        LocalDateTime createdAt
) {}
