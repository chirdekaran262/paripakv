package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

}
