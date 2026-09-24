package com.sms.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sms.dto.PaymentRequestDto;
import com.sms.entity.Payment;
import com.sms.entity.PaymentStatus;
import com.sms.entity.SanitizationService;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.PaymentRepository;
import com.sms.repository.SanitizationServiceRepository;
import com.sms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final SanitizationServiceRepository serviceRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Override
    public Payment createOrder(PaymentRequestDto request) {

        // Get service from database
        SanitizationService service = serviceRepository.findById(request.getServiceId()).orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // Check service is active
        if (service.getActive() == null || !service.getActive()) {
            throw new IllegalArgumentException("Selected service is not active");
        }

        // IMPORTANT:Price always comes from database.Never trust price from frontend.
        BigDecimal amount = service.getPrice();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid service price");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            // Razorpay uses paise
            long amountInPaise = amount.movePointRight(2).longValueExact();
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "SMS_" + System.currentTimeMillis());
            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            // Store payment + service request details until payment is successfully verified.
            Payment payment = Payment.builder()
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amount)
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .customerName(request.getCustomerName())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .address(request.getAddress())
                    .preferredDate(request.getPreferredDate())
                    .preferredTime(request.getPreferredTime())
                    .message(request.getMessage())

                    // Actual service entity
                    .service(service)
                    .build();
            return paymentRepository.save(payment);
        } catch (RazorpayException e) {
            throw new RuntimeException("Unable to create Razorpay order", e);
        }
    }

    @Override
    public Payment verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        System.out.println("========== RAZORPAY VERIFY ==========");
        System.out.println("Order ID: " + razorpayOrderId);
        System.out.println("Payment ID: " + razorpayPaymentId);
        System.out.println("Signature received: " + razorpaySignature);
        System.out.println("Secret configured: " + (razorpayKeySecret != null && !razorpayKeySecret.trim().isEmpty()));
        System.out.println("Secret length: " + (razorpayKeySecret == null ? 0 : razorpayKeySecret.length()));
        System.out.println("======================================");

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        System.out.println("Payment found in DB: " + payment.getRazorpayOrderId());
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return payment;
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", payment.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);
            System.out.println("Starting Razorpay signature verification...");
            boolean verified = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
            System.out.println("Signature verified: " + verified);
            if (!verified) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new IllegalArgumentException("Payment signature verification failed");
            }

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(PaymentStatus.SUCCESS);
            System.out.println("Payment verification SUCCESS");
            return paymentRepository.save(payment);
        } catch (RazorpayException e) {
            e.printStackTrace();
            throw new RuntimeException("Unable to verify Razorpay payment: " + e.getMessage(), e);
        }
    }

}
