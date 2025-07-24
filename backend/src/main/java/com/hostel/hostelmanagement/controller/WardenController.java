package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.ComplaintDto;
import com.hostel.hostelmanagement.dto.TicketDto;
import com.hostel.hostelmanagement.dto.TicketRequestDto;
import com.hostel.hostelmanagement.dto.UserDto;
import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.service.WardenService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warden")
@AllArgsConstructor
@PreAuthorize("hasRole('WARDEN')") // Secures all methods in this controller
public class WardenController {

    private final WardenService wardenService;

    // GET /api/warden/complaints
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintDto>> getAllComplaints() {
        List<ComplaintDto> complaints = wardenService.viewAllComplaints();
        return ResponseEntity.ok(complaints);
    }


    // POST /api/warden/tickets
    @PostMapping("/tickets")
    public ResponseEntity<TicketDto> generateTicket(@RequestBody TicketRequestDto ticketRequestDto) {
        TicketDto newTicket = wardenService.createTicket(ticketRequestDto);
        return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
    }

    @PostMapping("/complaints/{complaintId}/approve-cleaning")
    public ResponseEntity<ComplaintDto> approveCleaning(
            @PathVariable UUID complaintId,
            @RequestParam UUID cleanerId
    ) {
        Complaint updatedComplaint = wardenService.approveCleaningComplaint(complaintId, cleanerId);
        ComplaintDto dto = wardenService.mapToDTO(updatedComplaint);
        return ResponseEntity.ok(dto);
    }


    // GET /api/warden/cleaners
    @GetMapping("/cleaners")
    public ResponseEntity<List<UserDto>> getAllCleaners() {
        List<UserDto> cleaners = wardenService.getAllCleaners();
        return ResponseEntity.ok(cleaners);
    }


}
