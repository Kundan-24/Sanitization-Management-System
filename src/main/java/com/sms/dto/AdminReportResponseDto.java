package com.sms.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminReportResponseDto {

    private List<AdminReportItemDto> records;

    private AdminReportSummaryDto summary;
}