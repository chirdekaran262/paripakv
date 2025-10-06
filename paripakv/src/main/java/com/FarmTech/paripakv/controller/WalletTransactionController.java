package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.model.WalletTransaction;
import com.FarmTech.paripakv.service.WalletTransactionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/walletTransactions")
@RequiredArgsConstructor
public class WalletTransactionController {

    private final WalletTransactionsService walletTransactionsService;

    @GetMapping("/getTransactions")
    public ResponseEntity<List<WalletTransaction>> getWalletTransaction(@RequestParam UUID userId) {
        return ResponseEntity.ok(walletTransactionsService.getWalletTransactions(userId));
    }
}
