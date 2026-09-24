package com.sms.config;

import com.sms.entity.Admin;
import com.sms.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminDataInitializer {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${admin.bootstrap.username:admin}")
    private String username;

    @Value("${admin.bootstrap.name:Administrator}")
    private String name;

    @Value("${admin.bootstrap.password:}")
    private String password;

    @Bean
    CommandLineRunner createDefaultAdmin(){
        return args -> {
             if (!bootstrapEnabled){
                 return;
             }

             if (!StringUtils.hasText(password)){
                 throw new IllegalArgumentException("Admin bootstrap is enabled but" + " ADMIN_BOOTSTRAP_PASSWORD is not configured.");
             }

             if (password.length() < 6){
                 throw new IllegalArgumentException("Admin bootstrap password must contain at least 6 characters.");
             }

             if (adminRepository.existsByUsername(username)){
                 log.info("Admin '{}' already exists. Bootstrap skipped.",username);
                 return;
             }

             Admin admin = Admin.builder()
                     .username(username)
                     .name(name)
                     .password(passwordEncoder.encode(password))
                     .role("ADMIN")
                     .build();

             adminRepository.save(admin);
             log.info("Initial admin account '{}' created successfully.",username);
        };
    }
}
