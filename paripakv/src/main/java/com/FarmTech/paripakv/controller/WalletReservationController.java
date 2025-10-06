package com.FarmTech.paripakv.controller;


import com.FarmTech.paripakv.model.WalletReservation;
import com.FarmTech.paripakv.service.WalletReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/walletReservation")
@RequiredArgsConstructor
public class WalletReservationController {

    private final WalletReservationService walletReservationService;

    @GetMapping("/get")
    public ResponseEntity<BigDecimal> getReservedAmount(@RequestParam UUID userId) {
System.out.println("getReservedAmount in controller");
        return new ResponseEntity<>(walletReservationService.getTotalReservedAmount(userId), HttpStatus.OK);
    }

    @GetMapping("/getList")
    public ResponseEntity<List<WalletReservation>> getReservedList(@RequestParam UUID userId) {
        return new ResponseEntity<>(walletReservationService.getReservedList(userId),HttpStatus.OK);
    }
}
