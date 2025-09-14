package com.FarmTech.paripakv.model;


import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Users implements UserDetails {

    @Id
    @GeneratedValue
    private UUID id;


    @Column(unique = true, nullable = false)
    private String email; // used for login

    @Column(nullable = true)
    private String password;

    @Column(nullable = true)
    private String mobile;

    @Column(nullable = true, unique = true)
    private String aadhaar;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private UserRole role;

    @Column(nullable = true)
    private String address;
    @Column(nullable = true)
    private String village;
    @Column(nullable = true)
    private String district;
    @Column(nullable = true)
    private String state;
    @Column(nullable = true)
    private String pincode;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.LOCAL;  // LOCAL or GOOGLE

    @Column(nullable = false)
    private boolean profileCompleted = false;

<<<<<<< HEAD
=======
    private String imageUrl;
>>>>>>> new-feature
}
