package com.hostel.hostelmanagement.model;

public enum ComplaintStatus {
    SUBMITTED,
    IN_PROGRESS, // Can be used for cleaning tasks
    TICKET_GENERATED, // New status for when a ticket is made
    COMPLETED,
    REJECTED,
    ASSIGNED,
}