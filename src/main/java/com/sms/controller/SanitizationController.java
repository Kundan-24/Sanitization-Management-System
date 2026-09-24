package com.sms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class SanitizationController {

    @GetMapping({"/","/home"})
    public String homePage(){
        return "home";
    }

    @GetMapping("/about")
    public String aboutPage(){return "about";}

    @GetMapping("/services")
    public String servicesPage(){
        return "services";
    }

    @GetMapping("/contact")
    public String contactPage(){
        return "contact";
    }

    @GetMapping("/track-request")
    public String trackRequest() {
        return "track-request";
    }

    @GetMapping("/login")
    public String loginPage() {return "login";}

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @GetMapping("/service-request")
    public String serviceRequest() {
        return "service-request";
    }

    @GetMapping ("/admin")
    public String adminDashboard(){
        return "admin/dashboard";
    }

    @GetMapping("/admin/requests")
    public String sanitizationRequests() {
    return "admin/requests";
    }

    @GetMapping("/admin/report")
    public String adminReport() {
    return "admin/report";
    }

    @GetMapping("/admin/add_services")
    public String manageServices() {
    return "admin/add_services";
    }

    @GetMapping("/admin/change-password")
    public String changePassword() {
        return "admin/change-password";
    }

}
