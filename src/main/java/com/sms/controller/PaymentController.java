package com.sms.controller;

import com.sms.dto.PaymentRequestDto;
import com.sms.entity.Payment;
import com.sms.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<Payment> createOrder(@Valid @RequestBody PaymentRequestDto request) {
        Payment payment = paymentService.createOrder(request);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestParam String razorpayOrderId, @RequestParam String razorpayPaymentId, @RequestParam String razorpaySignature) {
        Payment payment = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        return ResponseEntity.ok(payment);
    }
}