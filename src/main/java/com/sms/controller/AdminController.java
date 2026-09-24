package com.sms.controller;

import com.sms.dto.ChangePasswordDto;
import com.sms.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDto request, Authentication authentication){
        String username = authentication.getName();
        adminService.changePassword(username,request.getCurrentPassword(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok("Password changed successfully");
    }
}
