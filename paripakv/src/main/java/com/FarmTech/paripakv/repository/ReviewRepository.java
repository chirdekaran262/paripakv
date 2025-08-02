package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByBuyerId(UUID buyerId);
    List<Review> findByOrderId(UUID orderId);
}
