package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.model.Wallet;
import com.FarmTech.paripakv.model.WalletReservation;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.repository.WalletRepository;
import com.FarmTech.paripakv.repository.WalletReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class WalletReservationService {

    private final WalletReservationRepository walletReservationRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public BigDecimal getTotalReservedAmount(UUID userId) {
        try {
            Wallet wallet = walletRepository.findByUser(userRepository.findById(userId).orElseThrow());
            System.out.println("wallet in get resvervation: " + wallet);
            List<WalletReservation> walletReservation = walletReservationRepository.findByWallet(wallet);
            System.out.println(walletReservation);
            BigDecimal reservedAmount = BigDecimal.ZERO;
            for (WalletReservation reservation : walletReservation) {
                reservedAmount = reservedAmount.add(reservation.getAmount());
            }
            return reservedAmount;
        }
        catch (Exception e) {
            System.out.println(e);
            return BigDecimal.ZERO;
        }
    }

    public List<WalletReservation> getReservedList(UUID userId) {
        Wallet wallet = walletRepository.findByUser(userRepository.findById(userId).orElseThrow());
        System.out.println("wallet in get resvervation List: " + wallet);
        List<WalletReservation> walletReservation = walletReservationRepository.findByWallet(wallet);
        System.out.println("get list "+walletReservation);
        return walletReservation;
    }
}
