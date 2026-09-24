package com.sms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "service_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 30)
  private String trackingId;

  @Column(nullable = false, length = 100)
  private String customerName;

  @Column(nullable = false, length = 20)
  private String phone;

  @Column(length = 100)
  private String email;

  @Column(nullable = false, length = 500)
  private String address;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "service_id", nullable = false)
  private SanitizationService service;

  @Column(nullable = false)
  private LocalDateTime preferredDate;

  @Column(nullable = false)
  private LocalTime preferredTime;

  @Column(length = 100)
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private RequestStatus status;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "payment_id", nullable = false, unique = true)
  @JsonIgnore
  private Payment payment;

  @PrePersist
  protected void onCreate(){
    createdAt = LocalDateTime.now();
  }
}