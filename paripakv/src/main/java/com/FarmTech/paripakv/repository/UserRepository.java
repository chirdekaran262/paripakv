package com.FarmTech.paripakv.repository;


import com.FarmTech.paripakv.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

<<<<<<< HEAD
import java.util.Optional;
=======
>>>>>>> new-feature
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {

    Users findByEmail(String email);
}

