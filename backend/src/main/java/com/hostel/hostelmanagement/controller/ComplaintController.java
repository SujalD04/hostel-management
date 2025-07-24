package com.hostel.hostelmanagement.controller;

import com.hostel.hostelmanagement.dto.ComplaintRequestDto;
import com.hostel.hostelmanagement.dto.ComplaintResponseDto;
import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.service.ComplaintService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@AllArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // POST /api/complaints
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Complaint> fileComplaint(@RequestBody ComplaintRequestDto complaintDto) {
        Complaint newComplaint = complaintService.createComplaint(complaintDto);
        return new ResponseEntity<>(newComplaint, HttpStatus.CREATED);
    }

    @GetMapping("/my-complaints")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ComplaintResponseDto>> getMyComplaints() {
        List<ComplaintResponseDto> complaints = complaintService.getComplaintsForCurrentUser();
        return ResponseEntity.ok(complaints);
    }
}
