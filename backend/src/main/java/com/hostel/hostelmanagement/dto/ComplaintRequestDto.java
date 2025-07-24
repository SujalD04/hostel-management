package com.hostel.hostelmanagement.dto;

import com.hostel.hostelmanagement.model.ComplaintType;
import lombok.Data;

@Data
public class ComplaintRequestDto {
    private ComplaintType complaintType;
    private String location;
    private String description;
}
