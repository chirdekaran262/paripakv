package com.FarmTech.paripakv.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletReservation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    private UUID orderId;           // Which order this reservation belongs to

    @Column(nullable = false)
    private BigDecimal amount;      // Reserved amount for this order

    private LocalDateTime createdAt = LocalDateTime.now();
}
