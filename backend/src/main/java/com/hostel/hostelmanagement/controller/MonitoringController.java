package com.hostel.hostelmanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/perf")
public class MonitoringController {

    @Autowired
    private HealthEndpoint healthEndpoint;

    @Autowired
    private MetricsEndpoint metricsEndpoint;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Map<String, Object> getPerformanceStats() {
        Map<String, Object> response = new HashMap<>();

        // 1. Health status (includes DB, disk, etc.)
        response.put("health", healthEndpoint.health());

        // 2. Uptime
        response.put("uptime", metricsEndpoint.metric("process.uptime", null));

        // 3. Memory usage
        response.put("memUsed", metricsEndpoint.metric("jvm.memory.used", null));
        response.put("memMax", metricsEndpoint.metric("jvm.memory.max", null));

        // 4. CPU usage
        response.put("cpu", metricsEndpoint.metric("system.cpu.usage", null));

        // 5. HTTP request count
        response.put("httpCount", metricsEndpoint.metric("http.server.requests", null));

        return response;
    }
}
