package com.sms.repository;

import com.sms.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest,Long> {

    Optional<ServiceRequest> findByTrackingId(String trackingId);

    boolean existsByTrackingId(String trackingId);

    boolean existsByPaymentId(Long paymentId);

    @Query("SELECT DISTINCT r FROM ServiceRequest r JOIN FETCH r.service LEFT JOIN FETCH r.payment ORDER BY r.createdAt DESC")
    List<ServiceRequest> findAllForAdminReport();
}
