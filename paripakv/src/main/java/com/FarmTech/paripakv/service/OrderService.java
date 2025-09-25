package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.OrderRepository;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.utils.InvoiceGenerator;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repo;
    private final UserRepository userRepo;
    private final ProductListingRepository productListingRepo;

    private final String uploadDir = "uploads/proofs/";
    private final EmailService emailService;
    private final InvoiceGenerator invoiceGenerator;
    private final JavaMailSender mailSender;

    private final Cloudinary cloudinary;

    private final EmailTemplateService emailTemplateService;

    public Order placeOrder(Order order, String buyerEmail) throws MessagingException {
        // Fetch buyer details
        var buyer = userRepo.findByEmail(buyerEmail);
        order.setBuyerId(buyer.getId());
        String fullAddress = buyer.getAddress() + ", " +
                buyer.getVillage() + ", " +
                buyer.getDistrict() + ", " +
                buyer.getState() + " - " +
                buyer.getPincode();

        // Fetch product listing and farmer
        ProductListing productListing = productListingRepo.findById(order.getListingId()).orElse(null);
        if (productListing != null) {
            Optional<Users> farmerOpt = userRepo.findById(productListing.getFarmerId());
            if (farmerOpt.isPresent()) {
                Users farmer = farmerOpt.get();
                System.out.println(farmer);
                // Send email to farmer
                String farmerEmailContent = emailTemplateService.buildFarmerEmailContent(farmer.getName(), buyer.getName(), productListing.getName(), order.getTotalPrice(), fullAddress);
                emailService.sendEmail(farmer.getEmail(), "🛒 New Order Received - Paripakv", farmerEmailContent);
                System.out.println(order);
                // Send email to buyer
                String buyerEmailContent = emailTemplateService.buildBuyerEmailContent(buyer.getName(), productListing.getName(), order.getListingId());
                emailService.sendEmail(buyer.getEmail(), "⏳ Order Placed - Waiting for Farmer Confirmation", buyerEmailContent);
            }

        }


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

    public Order updateStatus(UUID id, OrderStatus status, double quantity) throws MessagingException {

        Order order = repo.findById(id).orElseThrow();
        Users buyer = userRepo.findById(order.getBuyerId())
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (status == OrderStatus.CONFIRMED) {
            // Update product quantity
            Optional<ProductListing> productListingOpt = productListingRepo.findById(order.getListingId());
            if (productListingOpt.isPresent()) {
                ProductListing productListing = productListingOpt.get();
                productListing.setQuantityKg(productListing.getQuantityKg() - quantity);
                productListingRepo.save(productListing);

                // Send email to buyer
                String buyerEmailContent = emailTemplateService.buildBuyerOrderConfirmedContent(
                        buyer.getName(),
                        productListing.getName(),
                        order.getId(),
                        quantity
                );
                emailService.sendEmail(
                        buyer.getEmail(),
                        "✅ Your Order Has Been Confirmed - Paripakv",
                        buyerEmailContent
                );
            } else {
                throw new RuntimeException("Product listing not found for id: " + order.getListingId());
            }
        }

        order.setStatus(status);
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
    public void pickupOrder(UUID orderId, UUID transporterId) throws MessagingException {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getTransporterId() != null) {
            throw new RuntimeException("Order already picked up by someone");
        }

        order.setTransporterId(transporterId);
        order.setDeliveryStatus(DeliveryStatus.PICKED_UP);
        order.setPickupTime(LocalDateTime.now());

        repo.save(order);

        // Fetch related users
        Users buyer = userRepo.findById(order.getBuyerId())
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        ProductListing productListing = productListingRepo.findById(order.getListingId())
                .orElseThrow(() -> new RuntimeException("Product listing not found"));

        Users farmer = userRepo.findById(productListing.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Users transporter = userRepo.findById(transporterId)
                .orElseThrow(() -> new RuntimeException("Transporter not found"));

        // Send email to buyer
        String buyerEmailContent = emailTemplateService.buildBuyerPickupEmailContent(
                buyer.getName(),
                productListing.getName(),
                order.getId(),
                transporter.getName(),
                order.getPickupTime()
        );
        emailService.sendEmail(
                buyer.getEmail(),
                "📦 Your Order Has Been Picked Up",
                buyerEmailContent
        );

        // Send email to farmer
        String farmerEmailContent = emailTemplateService.buildFarmerPickupEmailContent(
                farmer.getName(),
                productListing.getName(),
                order.getId(),
                transporter.getName(),
                order.getPickupTime()
        );
        emailService.sendEmail(
                farmer.getEmail(),
                "📦 Your Produce Has Been Picked Up",
                farmerEmailContent
        );
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


            SecureRandom random = new SecureRandom();
            String otp = String.format("%06d", random.nextInt(1000000));
            order.setOtpCode(otp);
            order.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false);

            String htmlContent =
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "  <meta charset='UTF-8'>" +
                            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                            "  <style>" +
                            "    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                            "    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }" +
                            "    h2 { color: #2E7D32; margin-top: 0; }" +
                            "    p { font-size: 16px; color: #555; line-height: 1.6; }" +
                            "    .otp { font-size: 24px; font-weight: bold; color: #2E7D32; margin: 15px 0; }" +
                            "    .footer { font-size: 12px; color: #999; text-align: center; margin-top: 30px; }" +
                            "    .footer a { color: #2E7D32; text-decoration: none; }" +
                            "    @media only screen and (max-width: 600px) {" +
                            "      .container { padding: 20px; }" +
                            "      .otp { font-size: 20px; }" +
                            "    }" +
                            "  </style>" +
                            "</head>" +
                            "<body>" +
                            "  <div class='container'>" +
                            "    <h2>🔐 Delivery OTP</h2>" +
                            "    <p>Hello,</p>" +
                            "    <p>Your delivery OTP is:</p>" +
                            "    <p class='otp'>" + otp + "</p>" +
                            "    <p>This OTP is valid for <strong>5 minutes</strong>. Please use it to verify your delivery.</p>" +
                            "    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>" +
                            "    <div class='footer'>" +
                            "      If you did not request this, please contact support at <a href='mailto:support@paripakv.com'>support@paripakv.com</a>." +
                            "    </div>" +
                            "  </div>" +
                            "</body>" +
                            "</html>";

            helper.setTo(users.getEmail());
            helper.setSubject("Delivery OTP - FarmTech Paripakv");
            helper.setText(htmlContent, true);
            // true = HTML

            mailSender.send(mimeMessage);
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "proofs/"));
            order.setProofImageUrl(uploadResult.get("secure_url").toString());
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
            helper.setSubject("✅ Your Order Has Been Delivered - Paripakv Invoice");

            String htmlContent =
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "  <meta charset='UTF-8'>" +
                            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                            "  <style>" +
                            "    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }" +
                            "    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }" +
                            "    h2 { color: #2E7D32; margin-top: 0; font-size: 22px; }" +
                            "    p { font-size: 16px; line-height: 1.6; color: #555555; }" +
                            "    .btn { display: inline-block; padding: 12px 24px; background-color: #2E7D32; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }" +
                            "    .footer { font-size: 12px; color: #999999; text-align: center; margin-top: 30px; }" +
                            "    .footer a { color: #2E7D32; text-decoration: none; }" +
                            "    @media only screen and (max-width: 600px) {" +
                            "      .container { padding: 20px; }" +
                            "      .btn { width: 100%; text-align: center; }" +
                            "    }" +
                            "  </style>" +
                            "</head>" +
                            "<body>" +
                            "  <div class='container'>" +
                            "    <h2>✅ Thank You for Shopping with Paripakv!</h2>" +
                            "    <p>Hello <strong>" + users.getName() + "</strong>,</p>" +
                            "    <p>We’re excited to inform you that your order for <strong>" + productListing.getName() + "</strong> has been <span style='color:#2E7D32; font-weight:bold;'>successfully delivered</span>.</p>" +
                            "    <p>Your invoice is attached to this email for your records.</p>" +
                            "    <a href='#' class='btn'>View Order Details</a>" +
                            "    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>" +
                            "    <div class='footer'>" +
                            "      If you have any questions, reply to this email or contact <a href='mailto:support@paripakv.com'>support@paripakv.com</a>.<br/>" +
                            "      © 2025 Paripakv. All rights reserved." +
                            "    </div>" +
                            "  </div>" +
                            "</body>" +
                            "</html>";

            helper.setText(htmlContent, true);



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
