package com.sms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceRequestDto {

    @NotBlank(message = "Payment order is required")
    private String paymentOrderId;
}