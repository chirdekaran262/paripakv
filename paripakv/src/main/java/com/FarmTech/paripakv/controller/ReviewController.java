package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.model.Review;
import com.FarmTech.paripakv.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Review> addReview(@RequestBody Review review, Authentication auth) {
        String email = auth.getName();
        Review savedReview = service.addReview(review, email);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Review>> getReviewsByBuyer(@PathVariable UUID buyerId) {
        return ResponseEntity.ok(service.getReviewsByBuyer(buyerId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Review>> getByOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(service.getByOrder(orderId));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Review>> getReviewsByFarmer(@PathVariable UUID farmerId) {
        return ResponseEntity.ok(service.getReviewsByFarmer(farmerId));
    }

    @GetMapping("/averagerating")
    public ResponseEntity<Double> getReviewsByAveragerating(@RequestParam UUID farmerId) {
        return ResponseEntity.ok(service.getAverageRatingForFarmer(farmerId));
    }
}
