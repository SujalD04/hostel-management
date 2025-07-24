package com.hostel.hostelmanagement.dto;

import com.hostel.hostelmanagement.model.ComplaintStatus;
import com.hostel.hostelmanagement.model.ComplaintType;
import com.hostel.hostelmanagement.model.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ComplaintDto {
    private TicketStatus ticketStatus;
    private UUID id;
    private UUID studentId;      // Just the ID, not the whole User proxy
    private UUID assignedToId;
    private String studentName;  // Optional: if you want to expose name
    private ComplaintType complaintType;
    private String location;
    private String description;
    private ComplaintStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
