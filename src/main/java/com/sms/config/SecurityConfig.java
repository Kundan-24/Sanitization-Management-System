package com.sms.config;

import com.sms.security.JwtCookieBearerTokenResolver;
import com.sms.security.SingleSessionFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;

import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtCookieBearerTokenResolver jwtCookieBearerTokenResolver;
    private final SingleSessionFilter singleSessionFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        http
                // CSRF
                .csrf(AbstractHttpConfigurer::disable)



                // STATELESS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // AUTHORIZATION
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC MVC PAGES
                        .requestMatchers("/", "/home", "/about", "/services", "/contact", "/track-request", "/service-request", "/login", "/register").permitAll()

                        // STATIC RESOURCES
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()

                        // PUBLIC APIs
                        .requestMatchers(HttpMethod.GET, "/api/services/active").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/service-requests").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/service-requests/tracking/**").permitAll()

                        // AUTH
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/payments/create-order", "/api/payments/verify")
                        .permitAll()

                        // ADMIN MVC
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // ADMIN APIs
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/services/**").hasRole("ADMIN")

                        // SERVICE REQUEST APIs
                        .requestMatchers(HttpMethod.GET, "/api/service-requests").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/service-requests/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/service-requests/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/service-requests/**").hasRole("ADMIN")

                        // EVERYTHING ELSE
                        .anyRequest().authenticated()
                )

                // EXCEPTION HANDLING
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            } else {
                                        response.sendRedirect("/login");
                                    }
                                }
                        )
                )

                // JWT RESOURCE SERVER
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(jwtCookieBearerTokenResolver)
                                .jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter))
                )

                // SINGLE LOGIN
                .addFilterAfter(singleSessionFilter, BearerTokenAuthenticationFilter.class);
        return http.build();
    }
}