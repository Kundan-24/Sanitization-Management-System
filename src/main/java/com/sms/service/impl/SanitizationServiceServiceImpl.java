package com.sms.service.impl;

import com.sms.entity.SanitizationService;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.SanitizationServiceRepository;
import com.sms.service.SanitizationServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanitizationServiceServiceImpl implements SanitizationServiceService {

    private final SanitizationServiceRepository serviceRepository;


    @Override
    public SanitizationService createService(SanitizationService service) {
        return serviceRepository.save(service);
    }

    @Override
    public List<SanitizationService> getAllServices() {
        return serviceRepository.findAll();
    }

    @Override
    public List<SanitizationService> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    @Override
    public SanitizationService getServiceById(Long id) {
        return serviceRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Service not found with id: "+ id));
    }

    @Override
    public SanitizationService updateService(Long id, SanitizationService service) {
        SanitizationService existingService = getServiceById(id);

        existingService.setName(service.getName());
        existingService.setDescription(service.getDescription());
        existingService.setPrice(service.getPrice());
        existingService.setImage(service.getImage());
        existingService.setActive(service.getActive());

        return serviceRepository.save(existingService);
    }

    @Override
    public void deleteService(Long id) {
        SanitizationService existingService = getServiceById(id);
        serviceRepository.delete(existingService);
    }
}
