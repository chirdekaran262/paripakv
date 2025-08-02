package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.model.TransportSchedule;
import com.FarmTech.paripakv.service.TransportScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/transport")
@CrossOrigin(origins = "http://localhost:3000")
public class TransportScheduleController {

    private final TransportScheduleService service;

    public TransportScheduleController(TransportScheduleService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('TRANSPORTER')")
    public ResponseEntity<TransportSchedule> create(@RequestBody TransportSchedule schedule, Authentication auth) {
        String email = auth.getName(); // Transporter email (authenticated user)
        TransportSchedule created = service.createSchedule(schedule);
        return new ResponseEntity<>(created, HttpStatus.CREATED); // 201 Created
    }

    @GetMapping
    public ResponseEntity<List<TransportSchedule>> getByVillageAndDate(
            @RequestParam String village,
            @RequestParam String date // Format: YYYY-MM-DD
    ) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<TransportSchedule> schedules = service.getScheduleByVillage(village, localDate);
            return ResponseEntity.ok(schedules); // 200 OK
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null); // 400 Bad Request
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransportSchedule>> getAll() {
        List<TransportSchedule> schedules = service.getAll();
        return ResponseEntity.ok(schedules); // 200 OK
    }
}
