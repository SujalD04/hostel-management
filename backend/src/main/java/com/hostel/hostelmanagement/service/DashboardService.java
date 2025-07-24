package com.hostel.hostelmanagement.service;

import com.hostel.hostelmanagement.dto.DashboardStatsDto;
import com.hostel.hostelmanagement.model.ComplaintStatus;
import com.hostel.hostelmanagement.model.TicketStatus;
import com.hostel.hostelmanagement.repository.ComplaintRepository;
import com.hostel.hostelmanagement.repository.TicketRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final TicketRepository ticketRepository;

    public DashboardStatsDto getDashboardStats() {
        return DashboardStatsDto.builder()
                .totalComplaints(complaintRepository.count())
                .pendingComplaints(complaintRepository.countByStatus(ComplaintStatus.SUBMITTED))
                .completedComplaints(complaintRepository.countByStatus(ComplaintStatus.COMPLETED))
                .openTickets(ticketRepository.countByStatus(TicketStatus.OPEN))
                .resolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED))
                .build();
    }
}
