package com.hostel.hostelmanagement.repository;

import com.hostel.hostelmanagement.model.Complaint;
import com.hostel.hostelmanagement.model.ComplaintStatus;
import com.hostel.hostelmanagement.model.ComplaintType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findAll();
    // Find all complaints filed by a specific student
    List<Complaint> findByStudentId(UUID studentId);
    List<Complaint> findByComplaintTypeAndStatus(ComplaintType complaintType, ComplaintStatus status);

    List<Complaint> findByAssignedToIdAndStatus(UUID assignedToId, ComplaintStatus status);

    List<Complaint> findByAssignedToId(UUID assignedToId);

    long countByStatus(ComplaintStatus status);
}
