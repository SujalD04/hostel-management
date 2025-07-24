package com.hostel.hostelmanagement.dto;

import com.hostel.hostelmanagement.model.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID; // ✅ Add this import

@Data
public class TicketDto {
    private UUID id;
    private String ticketNumber;

    private UUID complaintId; // ✅ Fix type here
    private String complaintDescription;
    private String complaintType;

    private UUID assignedToId;
    private String assignedToName;

    private UUID wardenId;
    private String wardenName;

    private TicketStatus status;
    private String resolutionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
