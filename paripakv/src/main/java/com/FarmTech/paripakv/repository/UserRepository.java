package com.FarmTech.paripakv.repository;


import com.FarmTech.paripakv.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {

    Users findByEmail(String email);
}

