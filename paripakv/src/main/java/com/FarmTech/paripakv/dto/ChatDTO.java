package com.FarmTech.paripakv.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatDTO {
    private UUID id;
    private UUID farmerId;
    private String farmerName;
    private UUID buyerId;
    private String buyerName;
    private UUID productId;
    private String productName;
    private String productImage;
    private LocalDateTime lastMessageAt;
    private String lastMessage;
    private Long unreadCount;

    // Constructors, getters, setters
    public ChatDTO() {}

}