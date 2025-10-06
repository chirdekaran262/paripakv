package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.exception.InsufficientBalanceException;
import com.FarmTech.paripakv.exception.UserNotFoundException;
import com.FarmTech.paripakv.model.*;
import com.FarmTech.paripakv.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository usersRepository;
    private final ProductListingRepository productListingRepository;
    private final WalletReservationRepository walletReservationRepository;

    // -------------------- Add Money --------------------
    @Transactional
    public void addMoney(UUID userId, BigDecimal amount) throws UserNotFoundException {
        Users user = usersRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        Wallet wallet = getOrCreateWallet(user);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        System.out.println(wallet);
        WalletTransaction txn = WalletTransaction.builder()
                .user(user)
                .amount(amount)
                .type(TransactionType.CREDIT)
                .createdAt(LocalDateTime.now())
                .description("Money added to wallet")
                .build();
        transactionRepository.save(txn);
    }

    // -------------------- Reserve Money (Escrow) --------------------
    @Transactional(propagation = Propagation.REQUIRED)
    public void reserveForOrder(UUID buyerId, UUID orderId, BigDecimal amount) throws InsufficientBalanceException, UserNotFoundException {
        Users buyer = usersRepository.findById(buyerId)
                .orElseThrow(() -> new UserNotFoundException(buyerId));

        Wallet wallet = getOrCreateWallet(buyer);

        if (wallet.getBalance().compareTo(amount) < 0)
            throw new InsufficientBalanceException("Insufficient balance");

        // Deduct from available balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // Create per-order reservation
        WalletReservation reservation = WalletReservation.builder()
                .wallet(wallet)
                .orderId(orderId)
                .amount(amount)
                .createdAt(LocalDateTime.now())
                .build();

        System.out.println("reservations "+walletReservationRepository.save(reservation));

        // Log transaction
        WalletTransaction txn = WalletTransaction.builder()
                .user(buyer)
                .amount(amount)
                .type(TransactionType.DEBIT)
                .description("Reserved for order " + orderId)
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(txn);
    }


    // -------------------- Release Money to Farmer & Transporter --------------------
    @Transactional
    public void transferAfterOtp(Order order) {
        Wallet buyerWallet = getOrCreateWallet(usersRepository.findById(order.getBuyerId()).orElseThrow(()->new RuntimeException("Buyer not found")));
        System.out.println("buyer order in transfer after otp "+buyerWallet);
        System.out.println("buyer order in transfer after otp "+order);
        WalletReservation reservation = walletReservationRepository.findByOrderId(order.getId());
        System.out.println("reservation in transfer after otp "+reservation);
        BigDecimal reservedAmount = reservation.getAmount();

        // Split 95%-5%
        BigDecimal farmerAmount = reservedAmount.multiply(BigDecimal.valueOf(0.95));
        BigDecimal transporterAmount = reservedAmount.multiply(BigDecimal.valueOf(0.05));
        System.out.println("farmerAmount "+farmerAmount);
        System.out.println("transporterAmount "+transporterAmount);
        // Credit Farmer
        ProductListing productListing=productListingRepository.findById(order.getListingId()).orElseThrow();
        System.out.println("productListing "+productListing);
        Wallet farmerWallet = getOrCreateWallet(usersRepository.findById(productListing.getFarmerId()).orElseThrow());
        System.out.println("farmerWallet "+farmerWallet);
        farmerWallet.setBalance(farmerWallet.getBalance().add(farmerAmount));
        System.out.println("farmerWallet after saving amount "+farmerWallet);
        walletRepository.save(farmerWallet);

        WalletTransaction farmerTxn = WalletTransaction.builder()
                .user(farmerWallet.getUser())
                .amount(farmerAmount)
                .type(TransactionType.CREDIT)
                .createdAt(LocalDateTime.now())
                .description("Received 95% payment from buyer for order " + order.getId())
                .build();
        transactionRepository.save(farmerTxn);

        // Credit Transporter
        Wallet transporterWallet = getOrCreateWallet(usersRepository.findById(order.getTransporterId()).orElseThrow());
        transporterWallet.setBalance(transporterWallet.getBalance().add(transporterAmount));
        walletRepository.save(transporterWallet);

        WalletTransaction transporterTxn = WalletTransaction.builder()
                .user(transporterWallet.getUser())
                .amount(transporterAmount)
                .type(TransactionType.CREDIT)
                .createdAt(LocalDateTime.now())
                .description("Received 5% delivery fee for order " + order.getId())
                .build();
        transactionRepository.save(transporterTxn);

        // Remove reservation record
        walletReservationRepository.delete(reservation);
    }


    // -------------------- Withdraw Money --------------------
    @Transactional
    public void withdraw(UUID userId, BigDecimal amount) throws UserNotFoundException, InsufficientBalanceException {
            Users user = usersRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        Wallet wallet = getOrCreateWallet(user);

        if (wallet.getBalance().compareTo(amount) < 0)
            throw new InsufficientBalanceException("Insufficient balance to withdraw");

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .user(user)
                .amount(amount)
                .type(TransactionType.DEBIT)
                .description("Withdrawal request")
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(txn);

        // TODO: integrate Razorpay Payout API here
    }

    // -------------------- Refund Money --------------------
    @Transactional
    public void refund(UUID buyerId,Order order, BigDecimal amount, String reason) throws UserNotFoundException {
        Users buyer = usersRepository.findById(buyerId).orElseThrow(() -> new UserNotFoundException(buyerId));
        Wallet buyerWallet = getOrCreateWallet(buyer);

        WalletReservation reservation = walletReservationRepository.findByWalletAndOrderId(buyerWallet, order.getId())
                .orElseThrow(() -> new RuntimeException("No reservation found for this order"));

        BigDecimal reservedAmount = reservation.getAmount();
        buyerWallet.setBalance(buyerWallet.getBalance().add(reservedAmount));
        walletRepository.save(buyerWallet);

        WalletTransaction txn = WalletTransaction.builder()
                .user(buyer)
                .amount(amount)
                .type(TransactionType.CREDIT)
                .createdAt(LocalDateTime.now())
                .description("Refund: " + reason)
                .build();
        transactionRepository.save(txn);
    }

    // -------------------- Helper Method --------------------
    private Wallet getOrCreateWallet(Users user) {
        Wallet wallet = walletRepository.findByUser(user);
        if (wallet == null) {
            wallet = Wallet.builder()
                    .user(user)
                    .balance(BigDecimal.ZERO)
                    .build();
            walletRepository.save(wallet);
        }
        return wallet;
    }



    public Wallet getBalance(UUID userId) {
        return walletRepository.findByUser(usersRepository.findById(userId).orElseThrow());
    }
}
