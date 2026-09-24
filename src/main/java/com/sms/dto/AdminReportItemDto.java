package com.sms.dto;

import com.sms.entity.PaymentStatus;
import com.sms.entity.RequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class AdminReportItemDto {

    // REQUEST
    private Long id;
    private String trackingId;
    private RequestStatus requestStatus;
    private LocalDateTime requestCreatedAt;

    // CUSTOMER
    private String customerName;
    private String phone;
    private String email;
    private String address;

    // SERVICE
    private String serviceName;
    private BigDecimal servicePrice;
    private LocalDateTime preferredDate;
    private LocalTime preferredTime;
    private String message;

    // PAYMENT
    private PaymentStatus paymentStatus;
    private BigDecimal paymentAmount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime paymentCreatedAt;
}