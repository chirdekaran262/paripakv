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
        String email = auth.getName(); // Authenticated user's email
        Review savedReview = service.addReview(review, email);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED); // 201 Created
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = service.getAll();
        return ResponseEntity.ok(reviews); // 200 OK
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<Review>> getReviewsByBuyer(@PathVariable UUID buyerId) {
        List<Review> reviews = service.getReviewsByBuyer(buyerId);
        return ResponseEntity.ok(reviews); // 200 OK
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Review>> getByOrder(@PathVariable UUID orderId) {
        List<Review> reviews = service.getByOrder(orderId);
        return ResponseEntity.ok(reviews); // 200 OK
    }
}
