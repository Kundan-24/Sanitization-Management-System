package com.sms.service;

import com.sms.dto.PaymentRequestDto;
import com.sms.entity.Payment;

public interface PaymentService {

    Payment createOrder(PaymentRequestDto request);

    Payment verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
}