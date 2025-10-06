package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.WalletReservation;
import com.FarmTech.paripakv.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WalletReservationRepository extends JpaRepository<WalletReservation, UUID> {
    Optional<WalletReservation> findByWalletAndOrderId(Wallet wallet, UUID orderId);
    List<WalletReservation> findByWallet(Wallet wallet);

    WalletReservation findByOrderId(UUID id);
}
