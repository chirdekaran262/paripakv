package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.service.ProductListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/listings")
@CrossOrigin(origins = "*")
public class ProductListingController {

    private final ProductListingService service;

    public ProductListingController(ProductListingService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ProductListing> createListing(@RequestBody ProductListing listing, Authentication auth) {
        String email = auth.getName();
        ProductListing createdListing = service.save(listing, email);
        return new ResponseEntity<>(createdListing, HttpStatus.CREATED); // 201 Created
    }


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
}
