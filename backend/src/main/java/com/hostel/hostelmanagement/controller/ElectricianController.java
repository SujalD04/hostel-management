package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.TicketDto;
import com.hostel.hostelmanagement.dto.TicketResolutionDto;
import com.hostel.hostelmanagement.model.Ticket;
import com.hostel.hostelmanagement.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/electrician")
@AllArgsConstructor
@PreAuthorize("hasRole('ELECTRICIAN')")
public class ElectricianController {

    private final EmployeeService employeeService;

    // GET /api/electrician/tickets
    @GetMapping("/tickets")
    public ResponseEntity<List<TicketDto>> getMyTickets() {
        List<TicketDto> tickets = employeeService.getAssignedTickets()
                .stream()
                .map(this::mapToDto)
                .toList();
        return ResponseEntity.ok(tickets);
    }

    // PATCH /api/electrician/tickets/{ticketId}/resolve
    @PatchMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<TicketDto> resolveTicket(@PathVariable UUID ticketId, @RequestBody TicketResolutionDto resolutionDto) {
        Ticket ticket = employeeService.resolveTicket(ticketId, resolutionDto);
        TicketDto dto = mapToDto(ticket);
        return ResponseEntity.ok(dto);
    }

    private TicketDto mapToDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setStatus(ticket.getStatus());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());

        dto.setComplaintId(UUID.fromString(ticket.getComplaint().getId().toString()));
        dto.setComplaintDescription(ticket.getComplaint().getDescription());
        dto.setComplaintType(ticket.getComplaint().getComplaintType().name());

        dto.setAssignedToId(ticket.getAssignedTo().getId());
        dto.setAssignedToName(ticket.getAssignedTo().getFullName());

        dto.setWardenId(ticket.getWarden().getId());
        dto.setWardenName(ticket.getWarden().getFullName());

        return dto;
    }
}
