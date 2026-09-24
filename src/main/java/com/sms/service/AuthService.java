package com.sms.service;

import com.sms.entity.Admin;

public interface AuthService {

    String loginAndGetToken(String username, String password);

    Admin getAdmin(String username);

    void logout(String username);
}