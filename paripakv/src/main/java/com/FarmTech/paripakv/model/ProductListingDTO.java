package com.FarmTech.paripakv.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProductListingDTO {
    private String name;
    private int quantityKg;
    private double pricePerKg;
    private String villageName;
    private LocalDate availableDate;
    private List<String> imageUrls;
}
