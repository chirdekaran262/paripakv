package com.FarmTech.paripakv.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SendMessageRequest {
    private UUID senderId; // Optional, can be derived from authentication
    private UUID receiverId;
    private UUID productId;
    private String content;
}