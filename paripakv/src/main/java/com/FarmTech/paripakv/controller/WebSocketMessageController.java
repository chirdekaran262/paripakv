package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.dto.MessageDTO;
import com.FarmTech.paripakv.dto.SendMessageRequest;
import com.FarmTech.paripakv.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketMessageController {

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Validate request
            System.out.println("sendMessage   "+request);
            if (request.getSenderId() == null || request.getReceiverId() == null ||
                    request.getProductId() == null || request.getContent() == null ||
                    request.getContent().trim().isEmpty()) {
                System.err.println("Invalid message request");
                return;
            }

            // Send message through service - this will handle the real-time notification
            MessageDTO messageDTO = messageService.sendMessage(
                    request.getSenderId(),
                    request.getReceiverId(),
                    request.getProductId(),
                    request.getContent().trim()
            );

            System.out.println("WebSocket message sent successfully: " + messageDTO.getId());

        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}