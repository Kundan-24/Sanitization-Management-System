package com.sms.controller;

import com.sms.dto.AdminReportFilterDto;
import com.sms.dto.AdminReportResponseDto;
import com.sms.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    // REPORT DATA
    @GetMapping
    public ResponseEntity<AdminReportResponseDto> getReport(@ModelAttribute AdminReportFilterDto filter) {
        return ResponseEntity.ok(adminReportService.getReport(filter));
    }

    // PDF
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@ModelAttribute AdminReportFilterDto filter) {
        byte[] pdf = adminReportService.generatePdf(filter);
        String filename = "sanitization-report-" + LocalDate.now() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}