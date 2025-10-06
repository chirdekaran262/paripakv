package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.exception.InsufficientBalanceException;
import com.FarmTech.paripakv.exception.UserNotFoundException;
import com.FarmTech.paripakv.model.Order;
import com.FarmTech.paripakv.model.OrderStatus;
import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.service.OrderService;
import com.FarmTech.paripakv.service.ProductListingService;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService service;
    private final ProductListingService productListingService;

    public OrderController(OrderService service,ProductListingService productListingService) {
        this.service = service;
        this.productListingService = productListingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order, Authentication auth) throws MessagingException, UserNotFoundException, InsufficientBalanceException {
        String buyerEmail = auth.getName();
        Order placedOrder = service.placeOrder(order, buyerEmail);
        System.out.println(placedOrder);
        return new ResponseEntity<>(placedOrder, HttpStatus.CREATED); // 201 Created
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = service.getAll();
        return ResponseEntity.ok(orders); // 200 OK
    }

    @GetMapping("/buyer/{buyerId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Order>> getOrdersByBuyer(@PathVariable UUID buyerId) {
        List<Order> orders = service.getOrdersByBuyer(buyerId);
        return ResponseEntity.ok(orders); // 200 OK
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('FARMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestParam String status,@RequestParam double quantity) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            Order updatedOrder = service.updateStatus(id, orderStatus,quantity);
            System.out.println(updatedOrder);
            return ResponseEntity.ok(updatedOrder); // 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value."); // 400 Bad Request
        } catch (MessagingException | UserNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/farmerOrders")
    public ResponseEntity<List<Order>> getFarmerOrders() {
        try {
            Users users = (Users) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<ProductListing> productListings = productListingService.getMy(users.getEmail());
            System.out.println("Product listings: " + productListings);

            List<Order> orders = new ArrayList<>();
            for (ProductListing productListing : productListings) {
                System.out.println("Checking orders for Listing ID: " + productListing.getId());
                List<Order> listingOrders = service.getOrdersListingId(productListing.getId());
                System.out.println("Orders found: " + listingOrders);

                if (listingOrders != null) {
                    orders.addAll(listingOrders);
                }
            }


            System.out.println("Fetched orders: " + orders);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        }
        catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getById")
    public ResponseEntity<Order> getOrderById(@RequestParam UUID id) {
        return new ResponseEntity<>(service.getById(id),HttpStatus.OK);
    }

    @GetMapping("/transporter/feed")
    public ResponseEntity<List<Order>> getOrdersToPickup() {
        return ResponseEntity.ok(service.getAvailableOrdersForPickup());
    }

    @PostMapping("/transporter/orders/{orderId}/pickup")
    public ResponseEntity<String> pickupOrder(
            @PathVariable UUID orderId,
            @RequestParam UUID transporterId
    ) throws MessagingException {
        service.pickupOrder(orderId, transporterId);
        return ResponseEntity.ok("Order picked up");
    }

    @PostMapping("/transporter/{orderId}/deliver")
    public ResponseEntity<String> deliverOrder(@PathVariable UUID orderId) {
        service.deliverOrder(orderId);
        return ResponseEntity.ok("Order delivered");
    }

    @GetMapping("/transporter/getOrder")
    public ResponseEntity<List<Order>> getOrdersByTransporterId(@RequestParam UUID transporterId) {
        return ResponseEntity.ok(service.getOrdersByTransporterId(transporterId));
    }

    @PutMapping("/transporter/{orderId}/inTransit")

    public ResponseEntity<String> inTransitOrder(@PathVariable UUID orderId) throws MessagingException, IOException {
            service.inTransitOrder(orderId);
            return ResponseEntity.ok("Order picked up");
    }



    @PostMapping("/{orderId}/proof")
    public ResponseEntity<String> uploadOrder(@PathVariable UUID orderId,@RequestParam("File") MultipartFile file) {
        try {
            return ResponseEntity.ok(service.uploadOrder(orderId, file));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/{orderId}/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> body) {



        return service.verifyOtp(orderId,body);
    }
}
