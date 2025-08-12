package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.OrderRepository;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.utils.InvoiceGenerator;
import jakarta.mail.internet.MimeMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@Service
public class OrderService {

    private final OrderRepository repo;
    private final UserRepository userRepo;
    private final ProductListingRepository productListingRepo;
    private final String uploadDir = "uploads/proofs/";
    private final EmailService emailService;
    private final InvoiceGenerator invoiceGenerator;
    private final JavaMailSender mailSender;

    public OrderService(OrderRepository repo, UserRepository userRepo, ProductListingRepository productListingRepo, EmailService emailService,InvoiceGenerator invoiceGenerator, JavaMailSender mailSender) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.productListingRepo = productListingRepo;
        this.emailService = emailService;
        this.invoiceGenerator = invoiceGenerator;
        this.mailSender = mailSender;
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
        System.out.println(repo.findAllByTransporterId(transporterId));
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

            Users users=userRepo.findById(order.getBuyerId()).get();


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

            SecureRandom random = new SecureRandom();
            String otp = String.format("%06d", random.nextInt(1000000));
            order.setOtpCode(otp);
            order.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false);

            String htmlContent = "<html><body>" +
                    "<p>Your delivery OTP is: <strong>" + otp + "</strong></p>" +
                    "<p>This OTP is valid for 5 minutes.</p>" +
                    "</body></html>";

            helper.setTo(users.getEmail());
            helper.setSubject("Delivery OTP");
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(mimeMessage);
            order.setProofImageUrl("/uploads/proofs/" + fileName);
            System.out.println(order);
            repo.save(order);

            return "Proof uploaded successfully";
        }
        catch (Exception e) {
            return e.getMessage();
        }
    }

    public ResponseEntity<String> verifyOtp(UUID orderId, Map<String, String> body) {
        String enteredOtp = body.get("code");

        if (enteredOtp == null || enteredOtp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("OTP cannot be empty");
        }

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOtpExpiry() == null || order.getOtpCode() == null) {
            return ResponseEntity.badRequest().body("No OTP generated for this order");
        }

        if (order.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }

        if (!order.getOtpCode().equals(enteredOtp)) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        order.setDeliveryStatus(DeliveryStatus.DELIVERED);
        order.setDeliveryTime(LocalDateTime.now());
        order.setOtpCode(null);
        order.setOtpExpiry(null);
        repo.save(order);

        Users users=userRepo.findById(order.getBuyerId()).get();
        ProductListing productListing = productListingRepo.findById(order.getListingId()).get();


        try {
            // 1. Generate PDF invoice and get file path
            String invoicePath = invoiceGenerator.generateInvoice(order);

            // 2. Create MIME message for email with attachment
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setTo(users.getEmail());
            helper.setSubject("Your Order Has Been Delivered - Invoice");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                    "<h2 style='color: #4CAF50;'>Thank you for shopping with Paripakv!</h2>" +
                    "<p>Hello <strong>" + users.getName() + "</strong>,</p>" +
                    "<p>Your order for <strong>" + productListing.getName() + "</strong> has been successfully delivered.</p>" +
                    "<p>Please find your invoice attached to this email.</p>" +
                    "<br>" +
                    "<p style='font-size: 12px; color: #777;'>If you have any questions, reply to this email or contact support@paripakv.com.</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);  // Set HTML email body

            File invoiceFile = new File(invoicePath);
            helper.addAttachment("Invoice.pdf", invoiceFile);

            mailSender.send(mimeMessage);

            System.out.println("Delivery confirmation email sent to " + users.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok("Delivery verified successfully");
    }


}
