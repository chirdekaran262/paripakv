package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.exception.InsufficientBalanceException;
import com.FarmTech.paripakv.exception.ResourceNotFoundException;
import com.FarmTech.paripakv.exception.UserNotFoundException;
import com.FarmTech.paripakv.model.Order;
import com.FarmTech.paripakv.model.Wallet;
import com.FarmTech.paripakv.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @PostMapping("/add")
    public String addMoney(@RequestParam UUID userId, @RequestParam BigDecimal amount) throws UserNotFoundException {
        walletService.addMoney(userId, amount);
        return "Money added successfully!";
    }

    @PostMapping("/reserve")
    public String reserveMoney(@RequestParam UUID buyerId,@RequestParam UUID orderId ,@RequestParam BigDecimal amount) throws UserNotFoundException, InsufficientBalanceException {
        walletService.reserveForOrder(buyerId,orderId,amount);
        return "Money reserved for order!";
    }

    @PostMapping("/transfer")
    public String transferAfterOtp(@RequestBody Order order) throws UserNotFoundException, ResourceNotFoundException {
        walletService.transferAfterOtp(order);
        return "Money transferred after OTP verification!";
    }

    @PostMapping("/withdraw")
    public String withdraw(@RequestParam UUID userId, @RequestParam BigDecimal amount) throws UserNotFoundException, InsufficientBalanceException {
        walletService.withdraw(userId, amount);
        return "Withdrawal request processed!";
    }


    @GetMapping("/get")
        public Wallet getBalance(@RequestParam UUID userId) throws UserNotFoundException {
        return walletService.getBalance(userId);
    }

}
