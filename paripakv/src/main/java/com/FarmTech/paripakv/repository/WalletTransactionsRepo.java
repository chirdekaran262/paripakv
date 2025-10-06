package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.controller.WalletTransactionController;
import com.FarmTech.paripakv.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WalletTransactionsRepo extends JpaRepository<WalletTransaction, UUID> {
    List<WalletTransaction> getByUserId(UUID userId);
}
