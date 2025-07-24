package com.hostel.hostelmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalComplaints;
    private long pendingComplaints;
    private long completedComplaints;
    private long openTickets;
    private long resolvedTickets;
}