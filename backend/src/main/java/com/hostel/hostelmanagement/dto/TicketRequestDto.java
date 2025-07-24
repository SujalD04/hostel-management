package com.hostel.hostelmanagement.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TicketRequestDto {
    private UUID complaintId;
    private UUID electricianId;
}
