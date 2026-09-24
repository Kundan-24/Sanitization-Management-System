package com.sms.service;

public interface AdminService {

    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);

}
