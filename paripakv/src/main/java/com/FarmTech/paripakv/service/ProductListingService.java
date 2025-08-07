package com.FarmTech.paripakv.service;


import com.FarmTech.paripakv.model.ProductImage;
import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.dto.ProductListingDTO;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductListingService {

    private final ProductListingRepository repo;
    private final UserRepository userRepo;
    public ProductListingService(ProductListingRepository repo, UserRepository userRepo ) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public Object saveWithUrls(ProductListingDTO dto, Authentication auth) {
        try {
            ProductListing productListing = new ProductListing();
            String email = auth.getName();
            Users user = userRepo.findByEmail(email);

            productListing.setName(dto.getName());
            productListing.setQuantityKg(dto.getQuantityKg());
            productListing.setPricePerKg(dto.getPricePerKg());
            productListing.setVillageName(dto.getVillageName());
            productListing.setAvailableDate(dto.getAvailableDate());
            productListing.setFarmerId(user.getId());

            // Add images
            for (String img : dto.getImageUrls()) {
                ProductImage productImage = new ProductImage();
                productImage.setImageUrl(img);
                productImage.setProduct(productListing); // Set reverse mapping
                productListing.getImages().add(productImage); // Add to product's list
            }

            // Save both listing and images in cascade
            return repo.save(productListing);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save listing: " + e.getMessage());
        }
    }



    public List<ProductListing> getAll() {
        return repo.findAll();
    }

    public List<ProductListing> getByVillage(String village) {
        return repo.findByVillageName(village);
    }

    public List<ProductListing> getByCropName(String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }


    public List<ProductListing> getMy(String email) {
        Users user = userRepo.findByEmail(email);

        return repo.findByFarmerId(user.getId());
    }

    public Optional<ProductListing> getbyId(UUID id) {
        return repo.findById(id);
    }
}
