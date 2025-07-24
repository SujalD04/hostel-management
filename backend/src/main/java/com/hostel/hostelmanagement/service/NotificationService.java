package com.hostel.hostelmanagement.service;

import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Async // This makes the method execute in a separate thread
    public void sendNotification(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            // message.setFrom("noreply@yourcollege.edu"); // Optional: set a 'from' address

            mailSender.send(message);
        } catch (Exception e) {
            // Log the exception, but don't re-throw it to avoid crashing the main thread
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}