package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.Review;
import com.FarmTech.paripakv.model.Users;
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

    public ReviewService(ReviewRepository repo,UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public Review addReview(Review review, String email) {
        Users buyer = userRepo.findByEmail(email);
        review.setBuyerId(buyer.getId());
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
}
