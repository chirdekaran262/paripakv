package com.FarmTech.paripakv.utils;

import com.FarmTech.paripakv.model.Order;
import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.property.HorizontalAlignment;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileNotFoundException;
import java.time.format.DateTimeFormatter;

@Component
public class InvoiceGenerator {

    private final ProductListingRepository productRepo;
    private final UserRepository userRepo;

    public InvoiceGenerator(ProductListingRepository productRepo,
                            UserRepository userRepo) {
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    public String generateInvoice(Order order) throws FileNotFoundException {
        ProductListing productListing = productRepo.findById(order.getListingId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Users user = userRepo.findById(order.getBuyerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filePath = "invoices/" + order.getId() + "_invoice.pdf";
        new File("invoices").mkdirs();

        PdfWriter writer = new PdfWriter(filePath);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // ====== HEADER ======
        try {
            Image logo = new Image(ImageDataFactory.create("src/main/resources/static/logo.png"))
                    .setWidth(80)
                    .setHeight(80)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(logo);
        } catch (Exception e) {
            // Skip logo if not found
        }

        Paragraph title = new Paragraph("Paripakv - Invoice")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(22)
                .setBold();
        document.add(title);

        document.add(new Paragraph("Order Date: " +
                order.getOrderDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .setTextAlignment(TextAlignment.RIGHT));

        document.add(new Paragraph("Invoice No: " + order.getId())
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginBottom(20));

        // ====== BUYER DETAILS ======
        Table buyerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        buyerTable.addCell(new Cell()
                .add(new Paragraph("Buyer Name").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        buyerTable.addCell(new Cell().add(new Paragraph(user.getName())));

        buyerTable.addCell(new Cell()
                .add(new Paragraph("Email").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        buyerTable.addCell(new Cell().add(new Paragraph(user.getEmail())));

        buyerTable.addCell(new Cell()
                .add(new Paragraph("Delivery Date").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        buyerTable.addCell(new Cell().add(new Paragraph(order.getDeliveryTime().toString())));

        document.add(buyerTable);

        // ====== PRODUCT DETAILS TABLE ======
        Table productTable = new Table(UnitValue.createPercentArray(new float[]{4, 2, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        productTable.addHeaderCell(new Cell()
                .add(new Paragraph("Product").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        productTable.addHeaderCell(new Cell()
                .add(new Paragraph("Quantity").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        productTable.addHeaderCell(new Cell()
                .add(new Paragraph("Price").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));

        productTable.addCell(new Cell().add(new Paragraph(productListing.getName())));
        productTable.addCell(new Cell().add(new Paragraph(String.valueOf(order.getQuantityKg()))));
        productTable.addCell(new Cell().add(new Paragraph("₹" + order.getTotalPrice())));

        document.add(productTable);

        // ====== TOTAL SECTION ======
        Table totalTable = new Table(UnitValue.createPercentArray(new float[]{6, 2}))
                .useAllAvailableWidth();

        totalTable.addCell(new Cell()
                .add(new Paragraph("Total Amount").setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        totalTable.addCell(new Cell()
                .add(new Paragraph("₹" + order.getTotalPrice()).setBold()));

        document.add(totalTable);

        // ====== FOOTER ======
        document.add(new Paragraph("\nThank you for shopping with Paripakv!")
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30));

        document.add(new Paragraph("For support, contact: support@paripakv.com")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY));

        document.close();
        return filePath;
    }
}
