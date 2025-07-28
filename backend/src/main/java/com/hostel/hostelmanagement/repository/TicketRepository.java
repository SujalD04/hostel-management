package com.hostel.hostelmanagement.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hostel.hostelmanagement.model.Ticket;
import com.hostel.hostelmanagement.model.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
//    List<Ticket> findByAssignedToId(UUID electricianId);
    List<Ticket> findByAssignedToIdAndStatusNot(UUID assignedToId, TicketStatus status);
    Optional<Ticket> findById(UUID ticketId);
    long countByStatus(TicketStatus status);
    Optional<Ticket> findByComplaintId(UUID complaintId);


}
