package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.model.ProductListing;
<<<<<<< HEAD
=======
import com.FarmTech.paripakv.dto.ProductListingDTO;
>>>>>>> new-feature
import com.FarmTech.paripakv.service.ProductListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
<<<<<<< HEAD
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
=======
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
>>>>>>> new-feature
import java.util.UUID;

@RestController
@RequestMapping("/listings")
@CrossOrigin(origins = "*")
public class ProductListingController {

    private final ProductListingService service;
<<<<<<< HEAD

=======
>>>>>>> new-feature
    public ProductListingController(ProductListingService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
<<<<<<< HEAD
    public ResponseEntity<ProductListing> createListing(@RequestBody ProductListing listing, Authentication auth) {
        String email = auth.getName();
        ProductListing createdListing = service.save(listing, email);
        return new ResponseEntity<>(createdListing, HttpStatus.CREATED); // 201 Created
    }


=======
    public ResponseEntity<?> createListing(@RequestBody ProductListingDTO listing, Authentication auth) {
        try {
            return new ResponseEntity<>(service.saveWithUrls(listing, auth), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }



>>>>>>> new-feature
    @GetMapping
    public ResponseEntity<List<ProductListing>> getAll(
            @RequestParam(required = false) String village,
            @RequestParam(required = false) String name
    ) {
        List<ProductListing> listings;
        if (village != null) {
            listings = service.getByVillage(village);
        } else if (name != null) {
            listings = service.getByCropName(name);
        } else {
            listings = service.getAll();
        }

        return ResponseEntity.ok(listings); // 200 OK
    }



    @GetMapping("farmer")
    public ResponseEntity<List<ProductListing>> getMy() {  // Changed return type to List
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        List<ProductListing> farmerListings = service.getMy(email);  // Assume service returns List
        return ResponseEntity.ok(farmerListings);
    }

    @GetMapping("/byId")
    public ResponseEntity<ProductListing> getById(@RequestParam UUID id) {
        ProductListing productListing=service.getbyId(id).orElseThrow(() -> new RuntimeException("User not found"));

        return new ResponseEntity<>(productListing,HttpStatus.OK);
    }
<<<<<<< HEAD
=======

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String folderPath = "uploads/";
            File uploadDir = new File(folderPath);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(folderPath + fileName);
            Files.write(filePath, file.getBytes());

            String imageUrl = "/uploads/" + fileName; // Publicly accessible via static path
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed");
        }
    }

>>>>>>> new-feature
}
