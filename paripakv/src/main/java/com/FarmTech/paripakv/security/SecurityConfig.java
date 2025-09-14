package com.FarmTech.paripakv.security;

import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
=======
import org.springframework.beans.factory.annotation.Value;
>>>>>>> new-feature
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
<<<<<<< HEAD
=======
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

>>>>>>> new-feature
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

<<<<<<< HEAD
=======
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;
>>>>>>> new-feature

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http
                .csrf().disable()
                .cors()
                .and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register", "/users/login", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/users/forgot-password").permitAll()
<<<<<<< HEAD
                        .requestMatchers("/users/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/listings", "/listings/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/listings").hasRole("FARMER")
=======
                        .requestMatchers("/uploads/*").permitAll()
                        .requestMatchers("/uploads/proofs/*").permitAll()
                        .requestMatchers("/uploads/profile/*").permitAll()
                        .requestMatchers("/users/reset-password").permitAll()
                        .requestMatchers("/ws/**").permitAll()  // 👈 allow WS handshake
                        .requestMatchers("/topic/**", "/app/**").permitAll() // 👈 allow messaging endpoints
                        .requestMatchers(HttpMethod.GET, "/listings", "/listings/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/listings").hasRole("FARMER")
                        .requestMatchers("https://api.razorpay.com/**").permitAll()
>>>>>>> new-feature
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/users/oauth2/success", true)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
<<<<<<< HEAD
        configuration.setAllowedOrigins(List.of("https://paripakv-f.onrender.com")); // frontend origin
=======
        configuration.setAllowedOrigins(List.of(frontendBaseUrl)); // frontend origin
>>>>>>> new-feature
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // If you're sending cookies or auth headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
<<<<<<< HEAD

=======
    @Configuration
    public class WebConfig implements WebMvcConfigurer {
        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            registry
                    .addResourceHandler("/uploads/**")
                    .addResourceLocations("file:uploads/");
        }
    }
>>>>>>> new-feature
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
