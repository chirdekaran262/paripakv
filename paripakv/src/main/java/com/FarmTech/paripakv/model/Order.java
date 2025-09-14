package com.FarmTech.paripakv.model;

import jakarta.persistence.*;
import lombok.Data;

<<<<<<< HEAD
=======
import java.awt.*;
>>>>>>> new-feature
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID buyerId;

    private UUID listingId;

    private double quantityKg;

    private double totalPrice;

    private LocalDateTime orderDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private UUID transporterId;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    private LocalDateTime pickupTime;
    private LocalDateTime deliveryTime;

    private String deliveryAddress;

<<<<<<< HEAD
=======
    private String proofImageUrl;

    private String otpCode;
    private LocalDateTime otpExpiry;

>>>>>>> new-feature
}
