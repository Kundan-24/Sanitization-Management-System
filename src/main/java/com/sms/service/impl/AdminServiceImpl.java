package com.sms.service.impl;

import com.sms.entity.Admin;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.AdminRepository;
import com.sms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {

        Admin admin = adminRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        if (passwordEncoder.matches(newPassword, admin.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }
}
