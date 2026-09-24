package com.sms.service;

import com.sms.entity.ServiceRequest;

import java.util.List;

public interface ServiceRequestService {

    ServiceRequest createRequest(ServiceRequest request);

    List<ServiceRequest> getAllRequest();

    ServiceRequest getRequestById(Long id);

    ServiceRequest getRequestByTrackingId(String trackingId);

    ServiceRequest updateRequestStatus(Long id, String status);

    void  deleteRequest(Long id);
}
