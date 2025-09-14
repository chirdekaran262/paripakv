package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.dto.ChatDTO;
import com.FarmTech.paripakv.dto.MessageDTO;
import com.FarmTech.paripakv.dto.SendMessageRequest;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID currentUserId = getUserIdFromAuthentication(authentication);

            System.out.println("Send message request: " + request);
            System.out.println("Current user ID: " + currentUserId);

            MessageDTO message = messageService.sendMessage(
                    currentUserId,
                    request.getReceiverId(),
                    request.getProductId(),
                    request.getContent()
            );

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/messages/{otherUserId}/{productId}")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable UUID otherUserId,
            @PathVariable UUID productId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID currentUserId = getUserIdFromAuthentication(authentication);

            List<MessageDTO> messages = messageService.getMessagesBetweenUsers(
                    currentUserId, otherUserId, productId);

            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error getting messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/chats")
    public ResponseEntity<List<ChatDTO>> getUserChats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID currentUserId = getUserIdFromAuthentication(authentication);

            List<ChatDTO> chats = messageService.getUserChats(currentUserId);
            return ResponseEntity.ok(chats);
        } catch (Exception e) {
            System.err.println("Error getting user chats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/mark-read/{otherUserId}/{productId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID otherUserId,
            @PathVariable UUID productId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID currentUserId = getUserIdFromAuthentication(authentication);

            messageService.markMessagesAsRead(otherUserId, currentUserId, productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error marking messages as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID currentUserId = getUserIdFromAuthentication(authentication);

            Long count = messageService.getUnreadMessageCount(currentUserId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(0L);
        }
    }

    // Helper method - adapt this based on your authentication implementation
    private UUID getUserIdFromAuthentication(Authentication authentication) {
        // If you store user details in authentication principal
        if (authentication.getPrincipal() instanceof Users) {
            return ((Users) authentication.getPrincipal()).getId();
        }

        // If you use custom UserDetails implementation
        // if (authentication.getPrincipal() instanceof CustomUserPrincipal) {
        //     return ((CustomUserPrincipal) authentication.getPrincipal()).getUserId();
        // }

        // If you need to fetch from database by username
        // Users user = userRepository.findByUsername(authentication.getName());
        // return user.getId();

        throw new RuntimeException("Unable to get user ID from authentication");
    }
}