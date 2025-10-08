package com.FarmTech.paripakv.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailTemplateService {

    // ---------- Farmer: New Order ----------
    public String buildFarmerEmailContent(String farmerName, String buyerName, String productName, double totalPrice, String buyerAddress) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8' />" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0' />" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:0; }" +
                ".container { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); }" +
                "h2 { color:#2E7D32; font-size:22px; margin-top:0; }" +
                "p { color:#555; font-size:16px; line-height:1.6; }" +
                ".btn { display:inline-block; margin-top:20px; padding:12px 24px; background-color:#2E7D32; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; }" +
                ".footer { font-size:12px; color:#999; text-align:center; margin-top:30px; border-top:1px solid #eee; padding-top:15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>New Order Received</h2>" +
                "<p>Hello <strong>" + farmerName + "</strong>,</p>" +
                "<p>You have received a new order from <strong>" + buyerName + "</strong> for <strong>" + productName + "</strong>.</p>" +
                "<p><strong>Order Quantity:</strong> " + totalPrice + "<br/>" +
                "<strong>Delivery Address:</strong> " + buyerAddress + "</p>" +
                "<a href='#' class='btn'>View Order Details</a>" +
                "<div class='footer'>© 2025 Paripakv. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // ---------- Buyer: Order Placed ----------
    public String buildBuyerEmailContent(String buyerName, String productName, UUID productId) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8' />" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0' />" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:0; }" +
                ".container { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); }" +
                "h2 { color:#2E7D32; font-size:22px; margin-top:0; }" +
                "p { color:#555; font-size:16px; line-height:1.6; }" +
                ".footer { font-size:12px; color:#999; text-align:center; margin-top:30px; border-top:1px solid #eee; padding-top:15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Order Placed Successfully</h2>" +
                "<p>Hello <strong>" + buyerName + "</strong>,</p>" +
                "<p>Your order for <strong>" + productName + "</strong> has been placed and is awaiting farmer confirmation.</p>" +
                "<p><strong>Product ID:</strong> " + productId + "</p>" +
                "<div class='footer'>Thank you for using Paripakv.<br/>© 2025 Paripakv. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // ---------- Buyer: Order Confirmed ----------
    public String buildBuyerOrderConfirmedContent(String buyerName, String productName, UUID orderId, double quantity) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color:#f4f6f8; margin:0; padding:0; }" +
                ".container { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); }" +
                "h2 { color:#2E7D32; font-size:22px; margin-top:0; }" +
                "p { color:#555; font-size:16px; line-height:1.6; }" +
                ".highlight { color:#2E7D32; font-weight:bold; }" +
                ".footer { font-size:12px; color:#999; text-align:center; margin-top:30px; border-top:1px solid #eee; padding-top:15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Your Order Has Been Confirmed</h2>" +
                "<p>Hello <strong>" + buyerName + "</strong>,</p>" +
                "<p>Your order for <strong class='highlight'>" + productName + "</strong> (<strong>" + quantity + " kg</strong>) has been confirmed.</p>" +
                "<p><strong>Order ID:</strong> " + orderId + "</p>" +
                "<div class='footer'>Thank you for using Paripakv.<br/>© 2025 Paripakv. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // ---------- Buyer: Pickup Notification ----------
    public String buildBuyerPickupEmailContent(String buyerName, String productName, UUID orderId, String transporterName, LocalDateTime pickupTime) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color:#f4f6f8; margin:0; padding:0; }" +
                ".container { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); }" +
                "h2 { color:#2E7D32; font-size:22px; margin-top:0; }" +
                "p { color:#555; font-size:16px; line-height:1.6; }" +
                ".highlight { color:#2E7D32; font-weight:bold; }" +
                ".footer { font-size:12px; color:#999; text-align:center; margin-top:30px; border-top:1px solid #eee; padding-top:15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Your Order Has Been Picked Up</h2>" +
                "<p>Hello <strong>" + buyerName + "</strong>,</p>" +
                "<p>Your order for <strong class='highlight'>" + productName + "</strong> (Order ID: <strong>" + orderId + "</strong>) has been picked up by <strong class='highlight'>" + transporterName + "</strong>.</p>" +
                "<p>Pickup Time: <strong class='highlight'>" + pickupTime + "</strong></p>" +
                "<div class='footer'>Thank you for using Paripakv.<br/>© 2025 Paripakv. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // ---------- Farmer: Pickup Notification ----------
    public String buildFarmerPickupEmailContent(String farmerName, String productName, UUID orderId, String transporterName, LocalDateTime pickupTime) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color:#f4f6f8; margin:0; padding:0; }" +
                ".container { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); }" +
                "h2 { color:#2E7D32; font-size:22px; margin-top:0; }" +
                "p { color:#555; font-size:16px; line-height:1.6; }" +
                ".highlight { color:#2E7D32; font-weight:bold; }" +
                ".footer { font-size:12px; color:#999; text-align:center; margin-top:30px; border-top:1px solid #eee; padding-top:15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Your Produce Has Been Picked Up</h2>" +
                "<p>Hello <strong>" + farmerName + "</strong>,</p>" +
                "<p>Your produce for <strong class='highlight'>" + productName + "</strong> (Order ID: <strong>" + orderId + "</strong>) has been picked up by <strong class='highlight'>" + transporterName + "</strong>.</p>" +
                "<p>Pickup Time: <strong class='highlight'>" + pickupTime + "</strong></p>" +
                "<div class='footer'>© 2025 Paripakv. All rights reserved.</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
