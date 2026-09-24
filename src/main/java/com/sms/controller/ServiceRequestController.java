package com.sms.controller;

import com.sms.dto.ServiceRequestDto;
import com.sms.dto.ServiceRequestResponseDto;
import com.sms.entity.Payment;
import com.sms.entity.PaymentStatus;
import com.sms.entity.ServiceRequest;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.PaymentRepository;
import com.sms.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;
    private final PaymentRepository paymentRepository;


    // CREATE REQUEST
    @PostMapping
    public ResponseEntity<ServiceRequestResponseDto> createRequest(@Valid @RequestBody ServiceRequestDto requestDto) {

        // 1. Find payment using payment order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(requestDto.getPaymentOrderId()).orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));

        // 2. Payment MUST be successful
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Service request can only be created after successful payment");
        }

        // 3. Build request ONLY from payment data
        ServiceRequest request = ServiceRequest.builder()
                        .customerName(payment.getCustomerName())
                        .phone(payment.getPhone())
                        .email(payment.getEmail())
                        .address(payment.getAddress())
                        .service(payment.getService())
                        .preferredDate(payment.getPreferredDate())
                        .preferredTime(payment.getPreferredTime())
                        .message(payment.getMessage())
                        .payment(payment)
                        .build();

        // 4. Create service request
        ServiceRequest createdRequest = requestService.createRequest(request);

        // 5. Return safe response DTO
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(createdRequest));
    }

    // GET ALL REQUESTS
    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequest());
    }

    // GET REQUEST BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequestById(id));
    }

    // GET REQUEST BY TRACKING ID
    @GetMapping("/tracking/{trackingId}")
    public ResponseEntity<ServiceRequestResponseDto>
    getRequestByTrackingId(@PathVariable String trackingId) {
        ServiceRequest request = requestService.getRequestByTrackingId(trackingId);
        return ResponseEntity.ok(toResponseDto(request));
    }

    // UPDATE REQUEST STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateRequestStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(requestService.updateRequestStatus(id, status));
    }

    // DELETE REQUEST
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.ok("Service request deleted successfully");
    }

    // RESPONSE DTO MAPPER
    private ServiceRequestResponseDto toResponseDto(ServiceRequest request) {
        ServiceRequestResponseDto response = new ServiceRequestResponseDto();
        response.setId(request.getId());
        response.setTrackingId(request.getTrackingId());
        response.setCustomerName(request.getCustomerName());
        response.setPhone(request.getPhone());
        response.setEmail(request.getEmail());
        response.setAddress(request.getAddress());

        if (request.getService() != null) {
            response.setServiceName(request.getService().getName());
            response.setServicePrice(request.getService().getPrice());
        }

        response.setPreferredDate(request.getPreferredDate());
        response.setPreferredTime(request.getPreferredTime());
        response.setMessage(request.getMessage());

        // Request status tracking page ke liye
        response.setStatus(request.getStatus());
        response.setCreatedAt(request.getCreatedAt());

        return response;
    }
}