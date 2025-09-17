package com.FarmTech.paripakv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class TransportSchedule {

    @Id
    @GeneratedValue
    private UUID id;

    private String villageName;

    private LocalDate date;

    private String destination; // Market location

    @ElementCollection
    private List<UUID> orderIds;

    @ManyToOne
    private Users transporter;
}
