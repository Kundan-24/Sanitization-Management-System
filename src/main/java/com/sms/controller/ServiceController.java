package com.sms.controller;

import com.sms.dto.SanitizationServiceDto;
import com.sms.entity.SanitizationService;
import com.sms.service.CloudinaryService;
import com.sms.service.SanitizationServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final SanitizationServiceService service;
    private final CloudinaryService cloudinaryService;

    //CREATE
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<SanitizationService> createService(@Valid @RequestPart("service") SanitizationServiceDto request, @RequestPart(value = "image", required = false)MultipartFile image){
        String imageUrl = null;
        if (image != null && !image.isEmpty()){
            imageUrl = cloudinaryService.uploadImage(image);
        }
        SanitizationService serviceData = SanitizationService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .image(imageUrl)
                .active(request.getActive())
                .build();

        SanitizationService createdService = service.createService(serviceData);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<SanitizationService>> getAllServices(){
        return ResponseEntity.ok(service.getAllServices());
    }

    // GET ACTIVE SERVICES
    @GetMapping("/active")
    public ResponseEntity<List<SanitizationService>> getActiveServices(){
        return ResponseEntity.ok(service.getActiveServices());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<SanitizationService> getServiceById(@PathVariable Long id){
        return  ResponseEntity.ok(service.getServiceById(id));
    }

    // UPDATE
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<SanitizationService> updateService(@PathVariable Long id,@Valid @RequestPart("service") SanitizationServiceDto request, @RequestPart(value = "image", required = false) MultipartFile image){
        SanitizationService existing = service.getServiceById(id);
        String imageUrl = existing.getImage();
        if (image != null && !image.isEmpty()){
            imageUrl = cloudinaryService.uploadImage(image);
        }
        SanitizationService serviceData = SanitizationService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .image(imageUrl)
                .active(request.getActive())
                .build();

        return ResponseEntity.ok(service.updateService(id, serviceData));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id){
        service.deleteService(id);
        return ResponseEntity.ok("Service deleted successfully");
    }
}
