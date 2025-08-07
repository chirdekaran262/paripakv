package com.FarmTech.paripakv.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Data
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String imageUrl;  // e.g., /uploads/abc123_tomato.jpg

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference
    private ProductListing product;
}
