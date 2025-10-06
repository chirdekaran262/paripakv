package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Wallet findByUser(Users user);
}
