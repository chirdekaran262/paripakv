package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.ReviewRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository repo;
    private final UserRepository userRepo;
    private final OrderService orderService;
    private final ProductListingService productListingService;
    private final UserService userService;

    public ReviewService(ReviewRepository repo, UserRepository userRepo, OrderService orderService, ProductListingService productListingService, UserService userService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.orderService = orderService;
        this.productListingService = productListingService;
        this.userService = userService;
    }

    public Review addReview(Review review, String email) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        // Get logged-in buyer
        Users buyer = userRepo.findByEmail(email);
        review.setBuyerId(buyer.getId());


        // Fetch order
        Order order = orderService.getById(review.getOrderId());

        // Ensure order belongs to this buyer
        if (!order.getBuyerId().equals(buyer.getId())) {
            throw new SecurityException("You cannot review someone else's order");
        }

        // Ensure order is delivered
        if (!order.getDeliveryStatus().equals(DeliveryStatus.DELIVERED)) {
            throw new IllegalStateException("Cannot review before order is delivered");
        }

        // Prevent duplicate reviews
        if (repo.existsByOrderId(review.getOrderId())) {
            throw new IllegalStateException("Review already submitted for this order");
        }

        // Fetch product and farmer
        ProductListing productListing = productListingService.getbyId(order.getListingId())
                .orElseThrow(() -> new RuntimeException("Product listing not found"));

        Users farmer = userService.getById(productListing.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        // Link farmer
        review.setFarmerId(farmer.getId());

        return repo.save(review);
    }


    public List<Review> getReviewsByBuyer(UUID buyerId) {
        return repo.findByBuyerId(buyerId);
    }

    public List<Review> getByOrder(UUID orderId) {
        return repo.findByOrderId(orderId);
    }

    public List<Review> getAll() {
        return repo.findAll();
    }


    public List<Review> getReviewsByFarmer(UUID farmerId) {
        return repo.findByFarmerId(farmerId);
    }
    public double getAverageRatingForFarmer(UUID farmerId) {
        List<Review> reviews = repo.findByFarmerId(farmerId);
        return reviews.isEmpty() ? 0.0 :
                reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }

}
