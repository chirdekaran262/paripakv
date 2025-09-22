package com.FarmTech.paripakv.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*") // Add CORS support
public class PaymentController {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    // ✅ Create new order
    @PostMapping("/create-order") // Fixed: removed duplicate "/payment"
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> data) throws Exception {
        int amount = Integer.parseInt(data.get("amount").toString()); // ✅ fix parsing

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject options = new JSONObject();
        options.put("amount", amount * 100); // in paise
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("id", order.get("id"));          // order_id
        response.put("currency", order.get("currency"));
        response.put("amount", order.get("amount"));
        response.put("key", razorpayKeyId);           // only send key_id
        return response;
    }

    // ✅ Verify payment signature
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpaySignature = data.get("razorpay_signature");

            // Fixed: Create JSONObject properly for Utils.verifyPaymentSignature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpaySignature);

            JSONObject response = new JSONObject();
            if (isValid) {
                response.put("status", "success");
                response.put("message", "Payment Verified Successfully!");
                return ResponseEntity.ok(response.toMap());
            } else {
                response.put("status", "failed");
                response.put("message", "Payment Verification Failed!");
                return ResponseEntity.badRequest().body(response.toMap());
            }
        } catch (Exception e) {
            e.printStackTrace();
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Error while verifying payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse.toMap());
        }
    }

    @GetMapping("/validate-setup")
    public ResponseEntity<?> validateSetup() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if keys are properly configured
            response.put("keyConfigured", razorpayKeyId != null && !razorpayKeyId.isEmpty());
            response.put("secretConfigured", razorpayKeySecret != null && !razorpayKeySecret.isEmpty());
            response.put("isTestMode", razorpayKeyId.startsWith("rzp_test_"));
            response.put("keyPrefix", razorpayKeyId.substring(0, Math.min(12, razorpayKeyId.length())) + "...");

            // Try to create a test client
            RazorpayClient testClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            response.put("clientCreated", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", e.getMessage());
            response.put("clientCreated", false);
            return ResponseEntity.badRequest().body(response);
        }
    }
}