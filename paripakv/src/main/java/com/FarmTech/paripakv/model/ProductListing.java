package com.FarmTech.paripakv.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class ProductListing {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID farmerId;

    private String name;

    private double quantityKg;

    private double pricePerKg;

    private String villageName;

    private LocalDate availableDate;

    private LocalDateTime createdAt = LocalDateTime.now();
}
