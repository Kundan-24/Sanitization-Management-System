package com.sms.repository;

import com.sms.entity.SanitizationService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SanitizationServiceRepository extends JpaRepository<SanitizationService, Long> {

    List<SanitizationService> findByActiveTrue();
}
