package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.dto.ChatDTO;
import com.FarmTech.paripakv.dto.MessageDTO;
import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.ChatRepository;
import com.FarmTech.paripakv.repository.MessageRepository;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductListingRepository productRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public MessageDTO sendMessage(UUID senderId, UUID receiverId, UUID productId, String content) {
        Users sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        Users receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        ProductListing product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Users farmer = userRepository.findById(product.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        // Determine buyer and farmer correctly
        Users buyer;
        if(UserRole.BUYER.equals(sender.getRole())) {
            buyer=sender;
        }
        else {
            buyer=receiver;
        }

//        Users buyer = sender.getRole().equals("BUYER") ? sender :
//                (receiver.getRole().equals("BUYER") ? receiver : null);

        if (buyer == null) {
            throw new RuntimeException("No buyer found in this conversation");
        }

        // Create or update chat
        Users finalBuyer = buyer;
        Chat chat = chatRepository.findChatBetweenUsers(farmer.getId(), buyer.getId(), productId)
                .orElseGet(() -> {
                    Chat newChat = new Chat();
                    newChat.setFarmer(farmer);
                    newChat.setBuyer(finalBuyer);
                    newChat.setProduct(product);
                    return chatRepository.save(newChat);
                });

        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);

        // Create message
        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setProduct(product);
        message.setChat(chat); // Link message to chat

        Message savedMessage = messageRepository.save(message);

        // Send real-time notification
        MessageDTO messageDTO = new MessageDTO(savedMessage);
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/messages",
                messageDTO
        );

        return messageDTO;
    }

    public List<MessageDTO> getMessagesBetweenUsers(UUID userId1, UUID userId2, UUID productId) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(userId1, userId2, productId);
        return messages.stream()
                .map(MessageDTO::new)
                .collect(Collectors.toList());
    }

    public List<ChatDTO> getUserChats(UUID userId) {
        List<Chat> chats = chatRepository.findChatsByUser(userId);
        return chats.stream()
                .map(chat -> convertToChatDTO(chat, userId))
                .collect(Collectors.toList());
    }

    public void markMessagesAsRead(UUID senderId, UUID receiverId, UUID productId) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(senderId, receiverId, productId);
        messages.forEach(message -> {
            if (message.getReceiver().getId().equals(receiverId) && !message.isRead()) {
                message.setRead(true);
            }
        });
        messageRepository.saveAll(messages);
    }

    public Long getUnreadMessageCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    private ChatDTO convertToChatDTO(Chat chat, UUID currentUserId) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setFarmerId(chat.getFarmer().getId());
        dto.setFarmerName(chat.getFarmer().getName());
        dto.setBuyerId(chat.getBuyer().getId());
        dto.setBuyerName(chat.getBuyer().getName());
        dto.setProductId(chat.getProduct().getId());
        dto.setProductName(chat.getProduct().getName());

        // Handle product images safely
        if (chat.getProduct().getImages() != null) {
            dto.setProductImage(chat.getProduct().getImages().toString());
        }

        dto.setLastMessageAt(chat.getLastMessageAt());

        List<Message> messages = messageRepository.findMessagesBetweenUsers(
                chat.getFarmer().getId(), chat.getBuyer().getId(), chat.getProduct().getId());

        if (!messages.isEmpty()) {
            Message lastMessage = messages.get(messages.size() - 1);
            dto.setLastMessage(lastMessage.getContent());
        }

        // Calculate unread count for current user
        Long unreadCount = messageRepository.countUnreadMessagesInChat(
                chat.getFarmer().getId(), chat.getBuyer().getId(), chat.getProduct().getId(), currentUserId);
        dto.setUnreadCount(unreadCount);

        return dto;
    }
}