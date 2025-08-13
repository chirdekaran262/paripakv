package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.OrderRepository;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.utils.InvoiceGenerator;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
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

    public void inTransitOrder(UUID orderId) throws MessagingException, IOException {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        ProductListing productListing = productListingRepo.findById(order.getListingId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Users farmer = userRepo.findById(productListing.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Users transporter = userRepo.findById(order.getTransporterId())
                .orElseThrow(() -> new RuntimeException("Transporter not found"));

        // Prepare the email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(farmer.getEmail());
        helper.setSubject("Pickup Confirmation - Order " + order.getId());

        // Load the HTML template from resources
        ClassPathResource resource = new ClassPathResource("templates/pickup-confirmation.html");
        String htmlTemplate;
        try (InputStream inputStream = resource.getInputStream()) {
            htmlTemplate = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }

        // Replace placeholders
        htmlTemplate = htmlTemplate
                .replace("{{transporterName}}", transporter.getName())
                .replace("{{farmerName}}", farmer.getName())
                .replace("{{orderId}}", order.getId().toString())
                .replace("{{pickupTime}}",
                        order.getPickupTime() != null
                                ? order.getPickupTime().toString()
                                : "Not Specified");

        // Send HTML email
        helper.setText(htmlTemplate, true);
        mailSender.send(message);

        // Update order status
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

            String htmlContent =
                    "<html>" +
                            "<body style='font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;'>" +
                            "  <div style='max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);'>" +
                            "    <h2 style='color: #4CAF50; margin-top: 0;'>🔐 Delivery OTP</h2>" +
                            "    <p style='font-size: 16px; color: #555;'>Hello,</p>" +
                            "    <p style='font-size: 16px; color: #333;'>Your delivery OTP is:</p>" +
                            "    <p style='font-size: 20px; font-weight: bold; color: #4CAF50;'>" + otp + "</p>" +
                            "    <p style='font-size: 14px; color: #888;'>This OTP is valid for <strong>5 minutes</strong>. Please use it to verify your delivery.</p>" +
                            "    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>" +
                            "    <p style='font-size: 12px; color: #999; text-align: center;'>If you did not request this, please contact support at <a href='mailto:support@paripakv.com' style='color: #4CAF50;'>support@paripakv.com</a>.</p>" +
                            "  </div>" +
                            "</body>" +
                            "</html>";


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

            String htmlContent =
                    "<html>" +
                            "<body style='font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 0; margin: 0;'>" +
                            "  <div style='max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);'>" +
                            "    <h2 style='color: #4CAF50; margin-top: 0;'>✅ Thank You for Shopping with Paripakav!</h2>" +
                            "    <p style='font-size: 16px; color: #555;'>Hello <strong>" + users.getName() + "</strong>,</p>" +
                            "    <p style='font-size: 15px; color: #555;'>We’re excited to let you know that your order for <strong>" + productListing.getName() + "</strong> has been <span style='color:#4CAF50; font-weight:bold;'>successfully delivered</span>.</p>" +
                            "    <p style='font-size: 15px; color: #555;'>Your invoice is attached to this email for your records.</p>" +
                            "    <a href='#' style='display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;'>View Order Details</a>" +
                            "    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>" +
                            "    <p style='font-size: 12px; color: #999; text-align: center;'>If you have any questions, reply to this email or contact <a href='mailto:support@paripakv.com' style='color: #4CAF50; text-decoration: none;'>support@paripakv.com</a>.</p>" +
                            "    <p style='font-size: 12px; color: #bbb; text-align: center;'>© 2025 Paripakav. All rights reserved.</p>" +
                            "  </div>" +
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
