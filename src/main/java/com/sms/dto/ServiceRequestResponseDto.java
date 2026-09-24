package com.sms.dto;

import com.sms.entity.RequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class ServiceRequestResponseDto {

    private Long id;
    private String trackingId;
    private String customerName;
    private String phone;
    private String email;
    private String address;
    private String serviceName;
    private BigDecimal servicePrice;
    private LocalDateTime preferredDate;
    private LocalTime preferredTime;
    private String message;
    private RequestStatus status;
    private LocalDateTime createdAt;
}