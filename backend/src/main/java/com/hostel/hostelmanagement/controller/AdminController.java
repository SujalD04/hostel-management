package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.ComplaintResponseDto;
import com.hostel.hostelmanagement.dto.RegisterDto;
import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.model.Role;
import com.hostel.hostelmanagement.model.Ticket;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.repository.ComplaintRepository;
import com.hostel.hostelmanagement.repository.TicketRepository;
import com.hostel.hostelmanagement.repository.UserRepository;
import com.hostel.hostelmanagement.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final TicketRepository ticketRepository;

    // POST /api/admin/users
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createUser(@RequestBody RegisterDto registerDto) {
        authService.createUser(registerDto);
        return new ResponseEntity<>("User created successfully!", HttpStatus.CREATED);
    }

    // GET /api/admin/users/all
    @GetMapping("/users/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // GET /api/admin/users?role=ELECTRICIAN
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'WARDEN')")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam String role) {
        Role userRole = Role.valueOf(role.toUpperCase());
        return ResponseEntity.ok(userRepository.findByRole(userRole));
    }

    // ✅ GET /api/admin/complaints/all — full complaint + ticket history
    @GetMapping("/complaints/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComplaintResponseDto>> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAllWithTicketData();

        List<ComplaintResponseDto> response = complaints.stream().map(c -> {
            ComplaintResponseDto dto = new ComplaintResponseDto();
            dto.setId(c.getId());
            dto.setComplaintType(c.getComplaintType().toString());
            dto.setCreatedAt(c.getCreatedAt());
            dto.setLocation(c.getLocation());
            dto.setDescription(c.getDescription());
            dto.setStatus(c.getStatus().toString());

            if (c.getAssignedTo() != null)
                dto.setAssignedToName(c.getAssignedTo().getFullName());

            if (c.getStudent() != null)
                dto.setStudentName(c.getStudent().getFullName());

            // 🔧 Safely fetch and set ticket details if present
            ticketRepository.findByComplaintId(c.getId()).ifPresent(ticket -> {
                dto.setTicketId(ticket.getId().toString());

                if (ticket.getAssignedTo() != null)
                    dto.setTicketAssignedTo(ticket.getAssignedTo().getFullName());

                dto.setResolvedAt(ticket.getResolvedAt());
                dto.setResolutionNotes(ticket.getResolutionNotes());
            });

            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }


}
