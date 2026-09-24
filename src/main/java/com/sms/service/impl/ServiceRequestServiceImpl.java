package com.sms.service.impl;

import com.sms.entity.RequestStatus;
import com.sms.entity.ServiceRequest;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ServiceRequestRepository;
import com.sms.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private  final ServiceRequestRepository requestRepository;

    @Override
    public ServiceRequest createRequest(ServiceRequest request) {

        // Prevent same successful payment from creating multiple service requests.
        if (request.getPayment() != null && requestRepository.existsByPaymentId(request.getPayment().getId())) {
            throw new IllegalArgumentException("A service request already exists for this payment");
        }
        request.setTrackingId(generateTrackingId());
        request.setStatus(RequestStatus.PENDING);
        return requestRepository.save(request);
    }

    @Override
    public List<ServiceRequest> getAllRequest() {
        return requestRepository.findAll();
    }

    @Override
    public ServiceRequest getRequestById(Long id) {
        return requestRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Service request not found with id: "+ id));
    }

    @Override
    public ServiceRequest getRequestByTrackingId(String trackingId) {
        return requestRepository.findByTrackingId(trackingId).orElseThrow(()-> new  ResourceNotFoundException("Service request not found with tracking id: "+ trackingId));
    }

    @Override
    public ServiceRequest updateRequestStatus(Long id, String status) {
        ServiceRequest request = getRequestById(id);
        try {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            request.setStatus(requestStatus);
        }catch (IllegalArgumentException e){
            throw new IllegalArgumentException("Invalid request status: "+ status);
        }
        return requestRepository.save(request);
    }

    @Override
    public void deleteRequest(Long id) {
        ServiceRequest request = getRequestById(id);
        requestRepository.delete(request);
    }


    private String generateTrackingId(){
        String trackingId;
        do{
            trackingId = "SMS_" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
        }while (requestRepository.existsByTrackingId(trackingId));
        return trackingId;
    }
}
