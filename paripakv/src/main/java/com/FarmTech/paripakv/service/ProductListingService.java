package com.FarmTech.paripakv.service;


import com.FarmTech.paripakv.model.ProductListing;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.ProductListingRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductListingService {

    private final ProductListingRepository repo;
    private final UserRepository userRepo;

    public ProductListingService(ProductListingRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public ProductListing save(ProductListing product, String email) {
        Users farmer = userRepo.findByEmail(email);
        product.setFarmerId(farmer.getId());
        System.out.println(product);
        return repo.save(product);
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
