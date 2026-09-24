package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sanitization_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanitizationService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private  String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(length = 255)
    private  String image;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if(active == null){
            active = true;
        }
    }

    @PreUpdate
    protected void  onUpdate(){
        updatedAt = LocalDateTime.now();
    }
}
