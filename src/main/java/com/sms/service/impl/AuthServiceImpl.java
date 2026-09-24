package com.sms.service.impl;

import com.sms.dto.AdminLoginResponse;
import com.sms.entity.Admin;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.AdminRepository;
import com.sms.security.JwtService;
import com.sms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public String loginAndGetToken(String username, String password) {

        Admin admin = getAdmin(username);
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // New login = old token automatically invalid
        String tokenId = UUID.randomUUID().toString();
        admin.setCurrentTokenId(tokenId);
        adminRepository.save(admin);
        return jwtService.generateToken(admin, tokenId);
    }

    @Override
    public Admin getAdmin(String username) {
        return adminRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));
    }

    @Override
    public void logout(String username) {
        Admin admin = adminRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
        admin.setCurrentTokenId(null);
        adminRepository.save(admin);
    }
}