package com.sms.service;

import com.sms.dto.AdminReportResponseDto;

public interface AdminReportPdfService {

    byte[] generatePdf(AdminReportResponseDto report);
}