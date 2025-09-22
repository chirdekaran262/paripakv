package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.ProductListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductListingRepository extends JpaRepository<ProductListing, UUID> {
    List<ProductListing> findByVillageName(String villageName);
    List<ProductListing> findByNameContainingIgnoreCase(String name);


    List<ProductListing> findByFarmerId(UUID id);
}
