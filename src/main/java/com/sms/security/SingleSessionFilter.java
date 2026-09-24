package com.sms.security;

import com.sms.entity.Admin;
import com.sms.repository.AdminRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SingleSessionFilter extends OncePerRequestFilter {

    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getSubject();
            String tokenId = jwt.getClaimAsString("tokenId");

            Admin admin = adminRepository.findByUsername(username).orElse(null);
            boolean validSession = admin != null && tokenId != null && tokenId.equals(admin.getCurrentTokenId());

            if (!validSession) {
                // Old access_token cookie remove
                Cookie cookie = new Cookie("access_token", "");
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(0);

                response.addCookie(cookie);

                // API request ke liye 401
                if (request.getRequestURI().startsWith("/api/")) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Session expired. Please login again.\"}");
                    return;
                }

                // Browser page request -> Home Page
                response.sendRedirect("/");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}