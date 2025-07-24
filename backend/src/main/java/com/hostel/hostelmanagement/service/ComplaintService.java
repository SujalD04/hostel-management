package com.hostel.hostelmanagement.service;

import com.hostel.hostelmanagement.dto.ComplaintRequestDto;
import com.hostel.hostelmanagement.dto.ComplaintResponseDto;
import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.model.ComplaintStatus;
import com.hostel.hostelmanagement.model.Role;
import com.hostel.hostelmanagement.model.User;
import com.hostel.hostelmanagement.repository.ComplaintRepository;
import com.hostel.hostelmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Complaint createComplaint(ComplaintRequestDto complaintDto) {
        Complaint complaint = getComplaint(complaintDto, userRepository);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify all wardens about the new complaint
        List<User> wardens = userRepository.findByRole(Role.WARDEN);
        String subject = "New Complaint Submitted: " + savedComplaint.getComplaintType();
        String body = "A new complaint has been submitted.\n\nStudent: " + savedComplaint.getStudent().getFullName() + "\nType: " + savedComplaint.getComplaintType() + "\nLocation: " + savedComplaint.getLocation() + "\nDescription: " + savedComplaint.getDescription() + "\n\nPlease log in to the system to review it.";

        for (User warden : wardens) {
            notificationService.sendNotification(warden.getEmail(), subject, body);
        }

        return savedComplaint;
    }

    private ComplaintResponseDto mapToDto(Complaint complaint) {
        ComplaintResponseDto dto = new ComplaintResponseDto();
        dto.setId(complaint.getId());  // ✅ Directly assign UUID
        dto.setComplaintType(String.valueOf(complaint.getComplaintType()));
        dto.setLocation(complaint.getLocation());
        dto.setDescription(complaint.getDescription());
        dto.setStatus(complaint.getStatus().name());
        dto.setCreatedAt(complaint.getCreatedAt());
        if (complaint.getAssignedTo() != null) {
            dto.setAssignedToName(complaint.getAssignedTo().getFullName());
        }
        dto.setStudentName(complaint.getStudent().getFullName());
        return dto;
    }



    private static Complaint getComplaint(ComplaintRequestDto complaintDto, UserRepository userRepository) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Complaint complaint = new Complaint();
        complaint.setStudent(student);
        complaint.setComplaintType(complaintDto.getComplaintType());
        complaint.setLocation(complaintDto.getLocation());
        complaint.setDescription(complaintDto.getDescription());
        complaint.setStatus(ComplaintStatus.SUBMITTED); // Initial status
        return complaint;
    }

    public List<ComplaintResponseDto> getComplaintsForCurrentUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Complaint> complaints = complaintRepository.findByStudentId(student.getId());

        return complaints.stream()
                .map(this::mapToDto)
                .toList();
    }

}
