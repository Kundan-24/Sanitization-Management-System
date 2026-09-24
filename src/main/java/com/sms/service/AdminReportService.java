package com.sms.service;

import com.sms.dto.AdminReportFilterDto;
import com.sms.dto.AdminReportResponseDto;

public interface AdminReportService {

    AdminReportResponseDto getReport(AdminReportFilterDto filter);

    byte[] generatePdf(AdminReportFilterDto filter);
}