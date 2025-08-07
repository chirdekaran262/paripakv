package com.FarmTech.paripakv.dto;

import com.FarmTech.paripakv.model.UserRole;
import lombok.Data;

@Data
public class CompleteProfileRequest {
    private String mobile;
    private String aadhaar;
    private String password;
    private UserRole role;
    private String address;
    private String village;
    private String district;
    private String state;
    private String pincode;
}
