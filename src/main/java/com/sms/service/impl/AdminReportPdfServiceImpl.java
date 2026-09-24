package com.sms.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sms.dto.AdminReportItemDto;
import com.sms.dto.AdminReportResponseDto;
import com.sms.dto.AdminReportSummaryDto;
import com.sms.service.AdminReportPdfService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class AdminReportPdfServiceImpl implements AdminReportPdfService {

    @Override
    public byte[] generatePdf(AdminReportResponseDto report) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // TITLE
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Sanitization Management Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // SUMMARY
            AdminReportSummaryDto summary = report.getSummary();
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            addSummaryCell(summaryTable, "Total Requests", String.valueOf(summary.getTotalRequests()));
            addSummaryCell(summaryTable, "Pending", String.valueOf(summary.getPendingRequests()));
            addSummaryCell(summaryTable, "In Progress", String.valueOf(summary.getInProgressRequests()));
            addSummaryCell(summaryTable, "Completed", String.valueOf(summary.getCompletedRequests()));
            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // REVENUE
            Paragraph revenue = new Paragraph("Successful Payments: " + summary.getSuccessfulPayments() + "    |    Total Revenue: INR " + safeAmount(summary.getTotalRevenue()));
            revenue.setSpacingAfter(12);
            document.add(revenue);

            // REQUEST DETAILS
            if (report.getRecords() != null && !report.getRecords().isEmpty()) {
                for (AdminReportItemDto item : report.getRecords()) {
                    addRequestSection(document, item);
                }
            } else {
                document.add(new Paragraph("No service requests found."));
            }

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Unable to generate report PDF", e);
        }
    }

    // SUMMARY CELL
    private void addSummaryCell(PdfPTable table, String title, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        Paragraph paragraph = new Paragraph(title + "\n" + value);
        cell.addElement(paragraph);
        table.addCell(cell);
    }

    // REQUEST SECTION
    private void addRequestSection(Document document, AdminReportItemDto item) throws DocumentException {
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        document.add(new Paragraph("Request: " + safe(item.getTrackingId()), headingFont));
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        addRow(table, "Customer", item.getCustomerName());
        addRow(table, "Phone", item.getPhone());
        addRow(table, "Email", item.getEmail());
        addRow(table, "Address", item.getAddress());
        addRow(table, "Service", item.getServiceName());
        addRow(table, "Service Price", formatAmount(item.getServicePrice(), "INR"));
        addRow(table, "Preferred Date", item.getPreferredDate() != null ? item.getPreferredDate().toLocalDate().toString() : "N/A");
        addRow(table, "Preferred Time", item.getPreferredTime() != null ? item.getPreferredTime().toString() : "N/A");
        addRow(table, "Request Status", item.getRequestStatus() != null ? item.getRequestStatus().name() : "N/A");
        addRow(table, "Message", item.getMessage());

        // PAYMENT
        addRow(table, "Payment Status", item.getPaymentStatus() != null ? item.getPaymentStatus().name() : "N/A");
        addRow(table, "Payment Amount", formatAmount(item.getPaymentAmount(), item.getCurrency()));
        addRow(table, "Razorpay Order ID", item.getRazorpayOrderId());
        addRow(table, "Razorpay Payment ID", item.getRazorpayPaymentId());
        document.add(table);
        document.add(new Paragraph(" "));
    }

    // TABLE ROW
    private void addRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label));
        PdfPCell valueCell = new PdfPCell(new Phrase(safe(value)));
        labelCell.setPadding(5);
        valueCell.setPadding(5);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    // HELPERS
    private String safe(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }

    private String safeAmount(BigDecimal amount) {
        return amount == null ? "0.00" : amount.toPlainString();
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) {return "N/A";}
        String curr = currency == null || currency.isBlank() ? "INR" : currency;
        return curr + " " + amount.toPlainString();
    }
}