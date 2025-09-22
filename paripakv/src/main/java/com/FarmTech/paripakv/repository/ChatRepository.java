package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {

    @Query("SELECT c FROM Chat c WHERE " +
            "((c.farmer.id = :userId) OR (c.buyer.id = :userId)) " +
            "ORDER BY c.lastMessageAt DESC")
    List<Chat> findChatsByUser(@Param("userId") UUID userId);

    @Query("SELECT c FROM Chat c WHERE " +
            "c.farmer.id = :farmerId AND c.buyer.id = :buyerId " +
            "AND c.product.id = :productId")
    Optional<Chat> findChatBetweenUsers(@Param("farmerId") UUID farmerId,
                                        @Param("buyerId") UUID buyerId,
                                        @Param("productId") UUID productId);

    @Query("SELECT c FROM Chat c WHERE c.product.id = :productId")
    List<Chat> findChatsByProduct(@Param("productId") UUID productId);
}