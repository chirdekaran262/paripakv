package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE " +
            "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
            "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
            "AND m.product.id = :productId ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(@Param("userId1") UUID userId1,
                                           @Param("userId2") UUID userId2,
                                           @Param("productId") UUID productId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE " +
            "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
            "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
            "AND m.product.id = :productId AND m.receiver.id = :currentUserId AND m.isRead = false")
    Long countUnreadMessagesInChat(@Param("userId1") UUID userId1,
                                   @Param("userId2") UUID userId2,
                                   @Param("productId") UUID productId,
                                   @Param("currentUserId") UUID currentUserId);

    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    List<Message> findUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.timestamp ASC")
    List<Message> findByChatId(@Param("chatId") UUID chatId);
}
