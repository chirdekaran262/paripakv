package com.FarmTech.paripakv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Review {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID buyerId;

    @Column(nullable = false)
    private UUID farmerId;

    @Column(nullable = false, unique = true)
    private UUID orderId;

    @Column(nullable = false)
    private int rating;  // 1–5 stars

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
