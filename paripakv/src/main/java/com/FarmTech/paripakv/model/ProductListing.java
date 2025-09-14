package com.FarmTech.paripakv.model;

<<<<<<< HEAD
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
=======
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
>>>>>>> new-feature
import java.util.UUID;

@Entity
@Data
public class ProductListing {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID farmerId;

    private String name;

    private double quantityKg;

    private double pricePerKg;

    private String villageName;

    private LocalDate availableDate;

    private LocalDateTime createdAt = LocalDateTime.now();
<<<<<<< HEAD
=======

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductImage> images = new ArrayList<>();


>>>>>>> new-feature
}
