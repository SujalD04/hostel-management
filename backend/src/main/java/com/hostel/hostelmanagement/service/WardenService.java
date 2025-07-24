package com.hostel.hostelmanagement.service;

import com.hostel.hostelmanagement.dto.ComplaintDto;
import com.hostel.hostelmanagement.dto.TicketDto;
import com.hostel.hostelmanagement.dto.TicketRequestDto;
import com.hostel.hostelmanagement.dto.UserDto;
import com.hostel.hostelmanagement.model.*;
import com.hostel.hostelmanagement.repository.ComplaintRepository;
import com.hostel.hostelmanagement.repository.TicketRepository;
import com.hostel.hostelmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WardenService {

    private final ComplaintRepository complaintRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<UserDto> getAllCleaners() {
        List<User> cleaners = userRepository.findByRole(Role.CLEANER);
        return cleaners.stream()
                .map(user -> {
                    UserDto dto = new UserDto();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    public List<ComplaintDto> viewAllComplaints() {
        return complaintRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }


    public ComplaintDto mapToDTO(Complaint complaint) {
        ComplaintDto dto = new ComplaintDto();

        // Already a UUID, just assign it
        dto.setId(complaint.getId());

        // This must match the type in your User entity
        dto.setStudentId(complaint.getStudent().getId());

        dto.setStudentName(complaint.getStudent().getFullName());
        dto.setComplaintType(complaint.getComplaintType());
        dto.setLocation(complaint.getLocation());
        dto.setDescription(complaint.getDescription());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        if (complaint.getAssignedTo() != null) {
            dto.setAssignedToId(complaint.getAssignedTo().getId());
        }


        return dto;
    }


    private TicketDto mapToTicketDTO(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());

        dto.setComplaintId(ticket.getComplaint().getId());
        dto.setComplaintDescription(ticket.getComplaint().getDescription());

        dto.setAssignedToId(ticket.getAssignedTo().getId());
        dto.setAssignedToName(ticket.getAssignedTo().getFullName());

        dto.setWardenId(ticket.getWarden().getId());
        dto.setWardenName(ticket.getWarden().getFullName());

        dto.setStatus(ticket.getStatus());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());

        return dto;
    }




    @Transactional
    public TicketDto createTicket(TicketRequestDto requestDto) {
        // Get the warden performing this action
        String wardenEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User warden = userRepository.findByEmail(wardenEmail)
                .orElseThrow(() -> new RuntimeException("Warden not found"));

        // Get the complaint and the electrician to be assigned
        Complaint complaint = complaintRepository.findById(requestDto.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User electrician = userRepository.findById(requestDto.getElectricianId())
                .orElseThrow(() -> new RuntimeException("Electrician not found"));
        if (electrician.getRole() != Role.ELECTRICIAN) {
            throw new IllegalArgumentException("Assigned user must be an electrician.");
        }

        // Update complaint status
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaintRepository.save(complaint);

        // ✅ Generate the ticket number BEFORE saving
        String ticketNumber = "TKT-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 8);

        // Create the new ticket with the generated ticket number
        Ticket ticket = new Ticket();
        ticket.setComplaint(complaint);
        ticket.setWarden(warden);
        ticket.setAssignedTo(electrician);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setTicketNumber(ticketNumber);  // ✅ Set BEFORE save

        Ticket finalTicket = ticketRepository.save(ticket);  // Single save — done!

        // --- NOTIFICATION LOGIC ---
        // Notify the student
        String studentSubject = "Ticket Generated for Your Complaint: " + finalTicket.getTicketNumber();
        String studentBody = "Dear " + complaint.getStudent().getFullName() + ",\n\nA ticket has been generated for your complaint regarding '" + complaint.getDescription() + "'.\n\nTicket Number: " + finalTicket.getTicketNumber() + "\nAssigned to: " + electrician.getFullName() + "\n\nRegards,\nHostel Management";
        notificationService.sendNotification(complaint.getStudent().getEmail(), studentSubject, studentBody);

        // Notify the electrician
        String electricianSubject = "New Ticket Assigned to You: " + finalTicket.getTicketNumber();
        String electricianBody = "Hello " + electrician.getFullName() + ",\n\nYou have been assigned a new ticket.\n\nTicket Number: " + finalTicket.getTicketNumber() + "\nComplaint: " + complaint.getDescription() + "\nLocation: " + complaint.getLocation() + "\n\nPlease log in to the system to view details.";
        notificationService.sendNotification(electrician.getEmail(), electricianSubject, electricianBody);

        return mapToTicketDTO(finalTicket);
    }

    @Transactional
    public Complaint approveCleaningComplaint(UUID complaintId, UUID cleanerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getComplaintType() != ComplaintType.CLEANER) {
            throw new IllegalArgumentException("This action is only for cleaning complaints.");
        }

        User cleaner = userRepository.findById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));

        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setAssignedTo(cleaner);  // ✅ assign the cleaner

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify student
        String subject = "Your Complaint is In Progress";
        String body = "Dear " + savedComplaint.getStudent().getFullName() +
                ",\n\nYour cleaning complaint regarding '" + savedComplaint.getDescription() +
                "' has been approved and assigned to our cleaner.\n\nRegards,\nHostel Management";
        notificationService.sendNotification(savedComplaint.getStudent().getEmail(), subject, body);

        return savedComplaint;
    }
}