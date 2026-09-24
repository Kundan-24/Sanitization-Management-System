package com.sms.service;

import com.sms.entity.SanitizationService;

import java.util.List;

public interface SanitizationServiceService {

    SanitizationService createService(SanitizationService service);

    List<SanitizationService> getAllServices();

    List<SanitizationService> getActiveServices();

    SanitizationService getServiceById(Long id);

    SanitizationService updateService(Long id, SanitizationService service);

    void deleteService(Long id);
}
