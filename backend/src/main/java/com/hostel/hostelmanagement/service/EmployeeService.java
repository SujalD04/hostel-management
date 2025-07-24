package com.hostel.hostelmanagement.service;

import com.hostel.hostelmanagement.dto.CleaningTaskDto;
import com.hostel.hostelmanagement.dto.TicketResolutionDto;
import com.hostel.hostelmanagement.model.*;
import com.hostel.hostelmanagement.repository.ComplaintRepository;
import com.hostel.hostelmanagement.repository.TicketRepository;
import com.hostel.hostelmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class EmployeeService {

    private final ComplaintRepository complaintRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // --- Cleaner Methods ---
    public List<Complaint> getActiveCleaningTasks() {
        return complaintRepository.findByComplaintTypeAndStatus(ComplaintType.CLEANER, ComplaintStatus.IN_PROGRESS);
    }

    @Transactional
    public Complaint completeCleaningTask(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(ComplaintStatus.COMPLETED);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify student that their complaint has been completed
        String subject = "Your Complaint has been Resolved";
        String body = "Dear " + savedComplaint.getStudent().getFullName() + ",\n\nYour cleaning complaint regarding '" + savedComplaint.getDescription() + "' has been marked as completed.\n\nThank you,\nHostel Management";
        notificationService.sendNotification(savedComplaint.getStudent().getEmail(), subject, body);

        return savedComplaint;
    }

    public List<Ticket> getAssignedTickets() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User electrician = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Electrician not found"));
        return ticketRepository.findByAssignedToIdAndStatusNot(electrician.getId(), TicketStatus.RESOLVED);
    }

    @Transactional
    public Ticket resolveTicket(UUID ticketId, TicketResolutionDto resolutionDto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionDto.getResolutionNotes());
        ticket.setResolvedAt(LocalDateTime.now());

        // ✅ Also update the complaint:
        Complaint complaint = ticket.getComplaint();
        complaint.setStatus(ComplaintStatus.COMPLETED);

        complaintRepository.save(complaint); // <- Make sure to inject this

        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify student and warden about the resolution
        String subject = "Ticket Resolved: " + savedTicket.getTicketNumber();
        String studentBody = "Dear " + savedTicket.getComplaint().getStudent().getFullName() + ",\n\nTicket "
                + savedTicket.getTicketNumber() + " has been resolved.\n\nResolution Notes: "
                + savedTicket.getResolutionNotes() + "\n\nRegards,\nHostel Management";
        notificationService.sendNotification(savedTicket.getComplaint().getStudent().getEmail(), subject, studentBody);

        String wardenBody = "Hello " + savedTicket.getWarden().getFullName() + ",\n\nTicket "
                + savedTicket.getTicketNumber() + " assigned to " + savedTicket.getAssignedTo().getFullName()
                + " has been resolved.";
        notificationService.sendNotification(savedTicket.getWarden().getEmail(), subject, wardenBody);

        return savedTicket;
    }

    public List<CleaningTaskDto> getActiveCleaningTasks(UUID cleanerId) {
        return complaintRepository.findByAssignedToIdAndStatus(cleanerId, ComplaintStatus.IN_PROGRESS)
                .stream()
                .map(c -> new CleaningTaskDto(
                        c.getId(),
                        c.getComplaintType().name(),
                        c.getDescription(),
                        c.getLocation(),
                        c.getCreatedAt()
                ))
                .toList();
    }



}
