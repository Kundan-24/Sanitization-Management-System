package com.sms.service.impl;

import com.sms.dto.AdminReportFilterDto;
import com.sms.dto.AdminReportItemDto;
import com.sms.dto.AdminReportResponseDto;
import com.sms.dto.AdminReportSummaryDto;
import com.sms.entity.Payment;
import com.sms.entity.PaymentStatus;
import com.sms.entity.RequestStatus;
import com.sms.entity.ServiceRequest;
import com.sms.repository.ServiceRequestRepository;
import com.sms.service.AdminReportPdfService;
import com.sms.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final ServiceRequestRepository requestRepository;
    private final AdminReportPdfService adminReportPdfService;

    // GET REPORT
    @Override
    public AdminReportResponseDto getReport(AdminReportFilterDto filter) {
        List<ServiceRequest> requests = requestRepository.findAllForAdminReport();
        List<ServiceRequest> filteredRequests = requests.stream()
                        .filter(request -> matchesSearch(request, filter))
                        .filter(request -> matchesDate(request, filter))
                        .filter(request -> matchesStatus(request, filter))
                        .toList();

        List<AdminReportItemDto> records = new ArrayList<>();
        for (ServiceRequest request : filteredRequests) {
            records.add(mapToItemDto(request));
        }

        AdminReportSummaryDto summary = buildSummary(records);
        AdminReportResponseDto response = new AdminReportResponseDto();
        response.setRecords(records);
        response.setSummary(summary);
        return response;
    }


    // PDF
    @Override
    public byte[] generatePdf(AdminReportFilterDto filter) {
        AdminReportResponseDto report = getReport(filter);
        return adminReportPdfService.generatePdf(report);
    }

    // SEARCH FILTER
    private boolean matchesSearch(ServiceRequest request, AdminReportFilterDto filter) {
        if (filter == null || filter.getSearch() == null || filter.getSearch().isBlank()) {
            return true;
        }
        String search = filter.getSearch().trim().toLowerCase();
        if (contains(request.getTrackingId(), search)) {
            return true;
        }

        if (contains(request.getCustomerName(), search)) {
            return true;
        }

        if (contains(request.getPhone(), search)) {
            return true;
        }

        if (contains(request.getEmail(), search)) {
            return true;
        }

        if (contains(request.getAddress(), search)) {
            return true;
        }

        if (request.getService() != null && contains(request.getService().getName(), search)) {
            return true;
        }

        Payment payment = request.getPayment();
        if (payment != null) {
            if (contains(payment.getRazorpayOrderId(), search)) {
                return true;
            }

            if (contains(payment.getRazorpayPaymentId(), search)) {
                return true;
            }
        }
        return false;
    }


    // DATE FILTER
    private boolean matchesDate(ServiceRequest request, AdminReportFilterDto filter) {
        if (filter == null || filter.getDate() == null) {
            return true;
        }

        if (request.getPreferredDate() == null) {
            return false;
        }

        return request.getPreferredDate().toLocalDate().equals(filter.getDate());
    }

    // STATUS FILTER
    private boolean matchesStatus(ServiceRequest request, AdminReportFilterDto filter) {
        if (filter == null || filter.getStatus() == null || filter.getStatus().isBlank()) {
            return true;
        }

        if (request.getStatus() == null) {
            return false;
        }
        return request.getStatus().name().equalsIgnoreCase(filter.getStatus());
    }

    // STRING MATCH
    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    // MAP ENTITY -> DTO
    private AdminReportItemDto mapToItemDto(ServiceRequest request) {
        AdminReportItemDto dto = new AdminReportItemDto();
        // REQUEST
        dto.setId(request.getId());
        dto.setTrackingId(request.getTrackingId());
        dto.setRequestStatus(request.getStatus());
        dto.setRequestCreatedAt(request.getCreatedAt());

        // CUSTOMER
        dto.setCustomerName(request.getCustomerName());
        dto.setPhone(request.getPhone());
        dto.setEmail(request.getEmail());
        dto.setAddress(request.getAddress());

        // SERVICE
        if (request.getService() != null) {
            dto.setServiceName(request.getService().getName());
            dto.setServicePrice(request.getService().getPrice());
        }

        dto.setPreferredDate(request.getPreferredDate());
        dto.setPreferredTime(request.getPreferredTime());
        dto.setMessage(request.getMessage());

        // PAYMENT
        Payment payment = request.getPayment();
        if (payment != null) {
            dto.setPaymentStatus(payment.getStatus());
            dto.setPaymentAmount(payment.getAmount());
            dto.setCurrency(payment.getCurrency());
            dto.setRazorpayOrderId(payment.getRazorpayOrderId());
            dto.setRazorpayPaymentId(payment.getRazorpayPaymentId());
            dto.setPaymentCreatedAt(payment.getCreatedAt());
        }
        return dto;
    }

    // SUMMARY
    private AdminReportSummaryDto buildSummary(List<AdminReportItemDto> records) {
        AdminReportSummaryDto summary = new AdminReportSummaryDto();
        summary.setTotalRequests(records.size());
        long pending = records.stream().filter(r -> r.getRequestStatus() == RequestStatus.PENDING).count();
        long confirmed = records.stream().filter(r -> r.getRequestStatus() == RequestStatus.CONFIRMED).count();
        long inProgress = records.stream().filter(r -> r.getRequestStatus() == RequestStatus.IN_PROGRESS).count();
        long completed = records.stream().filter(r -> r.getRequestStatus() == RequestStatus.COMPLETED).count();
        long cancelled = records.stream().filter(r -> r.getRequestStatus() == RequestStatus.CANCELLED).count();
        long successfulPayments = records.stream().filter(r -> r.getPaymentStatus() == PaymentStatus.SUCCESS).count();
        BigDecimal totalRevenue = records.stream().filter(r -> r.getPaymentStatus() == PaymentStatus.SUCCESS)
                        .map(AdminReportItemDto::getPaymentAmount)
                        .filter(amount -> amount != null)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setPendingRequests(pending);
        summary.setConfirmedRequests(confirmed);
        summary.setInProgressRequests(inProgress);
        summary.setCompletedRequests(completed);
        summary.setCancelledRequests(cancelled);
        summary.setSuccessfulPayments(successfulPayments);
        summary.setTotalRevenue(totalRevenue);
        return summary;
    }
}