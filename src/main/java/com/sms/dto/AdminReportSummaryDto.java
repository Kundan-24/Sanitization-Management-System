package com.sms.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminReportSummaryDto {

    private long totalRequests;
    private long pendingRequests;
    private long confirmedRequests;
    private long inProgressRequests;
    private long completedRequests;
    private long cancelledRequests;
    private long successfulPayments;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
}