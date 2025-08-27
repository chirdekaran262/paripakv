package com.FarmTech.paripakv.dto;

import com.FarmTech.paripakv.model.Message;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageDTO {
    private UUID id;
    private String content;
    private UUID senderId;
    private String senderName;
    private UUID receiverId;
    private String receiverName;
    private UUID productId;
    private String productName;
    private LocalDateTime timestamp;
    private boolean isRead;

    public MessageDTO() {}

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getName();
        this.receiverId = message.getReceiver().getId();
        this.receiverName = message.getReceiver().getName();
        this.productId = message.getProduct().getId();
        this.productName = message.getProduct().getName();
        this.timestamp = message.getTimestamp();
        this.isRead = message.isRead();
    }

}