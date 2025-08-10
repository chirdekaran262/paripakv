package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.DeliveryStatus;
import com.FarmTech.paripakv.model.Order;
import com.FarmTech.paripakv.model.OrderStatus;
import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.repository.OrderRepository;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class OrderService {

    private final OrderRepository repo;
    private final UserRepository userRepo;
    private final ProductListingRepository productListingRepo;
    private final String uploadDir = "uploads/proofs/";
    public OrderService(OrderRepository repo, UserRepository userRepo, ProductListingRepository productListingRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.productListingRepo = productListingRepo;
    }

    public Order placeOrder(Order order, String buyerEmail) {
        var buyer = userRepo.findByEmail(buyerEmail);
        order.setBuyerId(buyer.getId());
        String fullAddress = buyer.getAddress() + ", " +
                buyer.getVillage() + ", " +
                buyer.getDistrict() + ", " +
                buyer.getState() + " - " +
                buyer.getPincode();

        order.setDeliveryAddress(fullAddress);

        // Set default delivery status
        order.setDeliveryStatus(DeliveryStatus.PENDING);
        return repo.save(order);
    }

    public List<Order> getOrdersByBuyer(UUID buyerId) {
        return repo.findByBuyerId(buyerId);
    }

    public List<Order> getAll() {
        return repo.findAll();
    }

    public Order updateStatus(UUID id, OrderStatus status,double quantity) {

        Order order = repo.findById(id).orElseThrow();
        if (status == OrderStatus.CONFIRMED) {
            Optional<ProductListing> productListing = productListingRepo.findById(order.getListingId());
            if (productListing.isPresent()) {
                ProductListing productListingObj = productListing.get();
                productListingObj.setQuantityKg(productListingObj.getQuantityKg() - quantity);
                productListingRepo.save(productListingObj);
            }
            else {
                throw new RuntimeException("Product listing not found for id: " + order.getListingId());
            }
        }

        order.setStatus(status);
        System.out.println(order);
        return repo.save(order);
    }


    public List<Order> getOrdersListingId(UUID id) {
        return repo.findAllByListingId(id);
    }

    public Order getById(UUID id) {
        return repo.findById(id).orElseThrow();
    }

    public List<Order> getAvailableOrdersForPickup() {
        return repo.findByStatusAndTransporterIdIsNull(OrderStatus.CONFIRMED);
    }
    public void pickupOrder(UUID orderId, UUID transporterId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getTransporterId() != null) {
            throw new RuntimeException("Order already picked by someone");
        }

            order.setTransporterId(transporterId);
            order.setDeliveryStatus(DeliveryStatus.PICKED_UP);
            order.setPickupTime(LocalDateTime.now());


        repo.save(order);
    }

    public void deliverOrder(UUID orderId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliveryStatus() == DeliveryStatus.PENDING) {
            throw new RuntimeException("Order not yet picked up");
        }

        order.setDeliveryStatus(DeliveryStatus.DELIVERED);
        order.setDeliveryTime(LocalDateTime.now());
        repo.save(order);
    }


    public List<Order> getOrdersByTransporterId(UUID transporterId) {
        return repo.findAllByTransporterId(transporterId);
    }

    public void inTransitOrder(UUID orderId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeliveryStatus(DeliveryStatus.IN_TRANSIT);
        repo.save(order);
    }

    public String uploadOrder(UUID orderId, MultipartFile file)  {
        try {
            System.out.println(file.getOriginalFilename());
            Order order = repo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
            System.out.println(order);
            if (order.getDeliveryStatus() == DeliveryStatus.DELIVERED) {
                return "Order already delivered up";
            }
            System.out.println(order);
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            System.out.println("Uploading file: " + file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Set proof image URL (assuming you serve static files from /uploads)
            order.setDeliveryStatus(DeliveryStatus.DELIVERED);
            order.setDeliveryTime(LocalDateTime.now());
            order.setProofImageUrl("/uploads/proofs/" + fileName);
            System.out.println(order);
            repo.save(order);

            return "Proof uploaded successfully";
        }
        catch (Exception e) {
            return e.getMessage();
        }
    }
}
