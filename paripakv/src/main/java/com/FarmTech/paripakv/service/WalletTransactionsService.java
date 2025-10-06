package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.controller.WalletTransactionController;
import com.FarmTech.paripakv.model.WalletTransaction;
import com.FarmTech.paripakv.repository.WalletTransactionsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletTransactionsService {
    private final WalletTransactionsRepo walletTransactionsRepo;

    public List<WalletTransaction> getWalletTransactions(UUID userId) {
        return walletTransactionsRepo.getByUserId(userId);
    }
}
