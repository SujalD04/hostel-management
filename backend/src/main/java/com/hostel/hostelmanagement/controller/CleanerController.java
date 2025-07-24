package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.CleaningTaskDto;
import com.hostel.hostelmanagement.dto.ComplaintDto;
import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.model.ComplaintStatus;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.repository.UserRepository;
import com.hostel.hostelmanagement.service.EmployeeService;
import com.hostel.hostelmanagement.repository.ComplaintRepository;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cleaner")
@AllArgsConstructor
@PreAuthorize("hasRole('CLEANER')")
public class CleanerController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;

    @GetMapping("/tasks")
    public ResponseEntity<List<CleaningTaskDto>> getAssignedCleaningTasks(@RequestParam UUID cleanerId) {
        List<Complaint> complaints = complaintRepository.findByAssignedToIdAndStatus(
                cleanerId,
                ComplaintStatus.IN_PROGRESS
        );

        List<CleaningTaskDto> dtos = complaints.stream()
                .map(this::mapToCleaningTaskDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private CleaningTaskDto mapToCleaningTaskDto(Complaint complaint) {
        return new CleaningTaskDto(
                complaint.getId(),
                complaint.getComplaintType().toString(),
                complaint.getDescription(),
                complaint.getLocation(),
                complaint.getCreatedAt()
        );
    }

    // POST /api/cleaner/tasks/{complaintId}/complete
    @PostMapping("/tasks/{complaintId}/complete")
    public ResponseEntity<ComplaintDto> completeCleaningTask(@PathVariable UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(ComplaintStatus.COMPLETED);
        complaintRepository.save(complaint);

        ComplaintDto dto = mapToDto(complaint);
        return ResponseEntity.ok(dto);
    }

    private ComplaintDto mapToDto(Complaint complaint) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(complaint.getId());
        dto.setStudentId(
                complaint.getStudent() != null ? complaint.getStudent().getId() : null
        );
        dto.setAssignedToId(
                complaint.getAssignedTo() != null ? complaint.getAssignedTo().getId() : null
        );
        dto.setStudentName(
                complaint.getStudent() != null ? complaint.getStudent().getFullName() : null
        );
        dto.setComplaintType(complaint.getComplaintType());
        dto.setLocation(complaint.getLocation());
        dto.setDescription(complaint.getDescription());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        return dto;
    }


}
