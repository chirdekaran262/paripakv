package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.dto.CompleteProfileRequest;
import com.FarmTech.paripakv.model.AuthProvider;
import com.FarmTech.paripakv.model.PasswordResetToken;
import com.FarmTech.paripakv.model.UserRole;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.PasswordResetTokenRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final String uploadDir="uploads/profile/";

    private final Cloudinary cloudinary;
    @Value("${backend.base-url}")
    private String backendUrl;
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repo.findByEmail(email);
    }

    public Users register(Users user, MultipartFile profileImage) throws IOException, MessagingException {
        
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filename = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();
        System.out.println(filename);

        Map uploadResult = cloudinary.uploader().upload(profileImage.getBytes(),
                ObjectUtils.asMap("folder", "profile/"));

        user.setImageUrl(uploadResult.get("secure_url").toString());
        user.setPassword(encoder.encode(user.getPassword()));
        System.out.println(user.getImageUrl());

        Users savedUser = repo.save(user);

        // ✅ Prepare a nice HTML mail
        String subject = "Welcome to FarmTech Paripakv!";

        String message = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <style>" +
                "    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                "    h2 { color: #2E7D32; margin-bottom: 20px; }" +
                "    p { color: #555555; line-height: 1.6; font-size: 16px; }" +
                "    .btn { display: inline-block; padding: 12px 24px; background-color: #2E7D32; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }" +
                "    .footer { font-size: 14px; color: #999999; margin-top: 30px; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='email-container'>" +
                "    <h2>Hello " + savedUser.getName() + ",</h2>" +
                "    <p>Welcome to <strong>FarmTech Paripakv</strong>! We are thrilled to have you join our platform.</p>" +
                "    <p>Get started by logging into your account and exploring all the features we offer to make your farming experience smarter and more efficient.</p>" +
                "    <a href='" + frontendBaseUrl + "/login' class='btn'>Login to Your Account</a>" +
                "    <p>If you did not sign up for FarmTech Paripakv, please ignore this email.</p>" +
                "    <div class='footer'>" +
                "      <p>Best regards,<br/>The FarmTech Paripakv Team<br/>Krishivision Organization</p>" +
                "      <p>Email: krishivision.tech@gmail.com</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";


        // ✅ Send the mail
        emailService.sendEmail(savedUser.getEmail(), subject, message);

        return savedUser;
    }


    public boolean passwordMatch(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }



    public Users findOrRegisterOAuthUser(String email, String name) {
        Users existing = repo.findByEmail(email);
        if (existing != null) {
            return existing;
        }

        Users user = new Users();
        user.setEmail(email);
        user.setName(name != null ? name : "Unknown");
        user.setPassword(""); // No password
        user.setMobile(null);
        user.setAadhaar(null);
        user.setRole(UserRole.FARMER);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setProfileCompleted(false);  // Flag for frontend

        return repo.save(user);
    }

    public void completeProfile(CompleteProfileRequest updatedUser, String email,MultipartFile profileImage) throws IOException {
        Users user = repo.findByEmail(email);

        File dir = new File(uploadDir);
        if(!dir.exists()){
            dir.mkdirs();
        }
        String filename=UUID.randomUUID()+"_"+profileImage.getOriginalFilename();
        System.out.println(filename);
        Path path = Paths.get(uploadDir+filename);
        Files.copy(profileImage.getInputStream(),path, StandardCopyOption.REPLACE_EXISTING);
        user.setImageUrl("/uploads/profile/"+filename);


        user.setMobile(updatedUser.getMobile());
        user.setAadhaar(updatedUser.getAadhaar());
        user.setRole(updatedUser.getRole());
        user.setAddress(updatedUser.getAddress());
        user.setVillage(updatedUser.getVillage());
        user.setDistrict(updatedUser.getDistrict());
        user.setState(updatedUser.getState());
        user.setPincode(updatedUser.getPincode());
        user.setProfileCompleted(true);

        repo.save(user);
    }
    public void initiatePasswordReset(String email) throws MessagingException {
        Users user = repo.findByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (user.getAuthProvider() == AuthProvider.GOOGLE) {
            throw new IllegalArgumentException("Password reset is not available for OAuth users. Please login via Google.");
        }

        // ✅ Delete old token if it exists
        tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

        // Create new token
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpirationTime(LocalDateTime.now().plusMinutes(30));

        tokenRepo.save(resetToken);

        String resetLink =  backendUrl + "/users/reset-password?token=" + token;

        String subject = "🔒 Reset Your Password - FarmTech Paripakv";

        String message = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <style>" +
                "    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                "    h2 { color: #2E7D32; margin-bottom: 20px; }" +
                "    p { color: #555555; line-height: 1.6; font-size: 16px; }" +
                "    .btn { display: inline-block; padding: 12px 24px; background-color: #2E7D32; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }" +
                "    .footer { font-size: 14px; color: #999999; margin-top: 30px; text-align: center; }" +
                "    @media only screen and (max-width: 600px) {" +
                "      .email-container { padding: 20px; }" +
                "      .btn { width: 100%; text-align: center; }" +
                "    }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='email-container'>" +
                "    <h2>Password Reset Request 🔑</h2>" +
                "    <p>Hello " + user.getName() + ",</p>" +
                "    <p>We received a request to reset your password for your <strong>FarmTech Paripakv</strong> account.</p>" +
                "    <p>Click the button below to securely reset your password:</p>" +
                "    <a href='" + resetLink + "' class='btn'>Reset Password</a>" +
                "    <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>" +
                "    <div class='footer'>" +
                "      &copy; 2025 FarmTech Paripakv | Empowering Indian Farmers 🌱<br/>" +
                "      Email: krishivision.tech@gmail.com" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";


        emailService.sendEmail(user.getEmail(), subject, message);

    }



    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        Users user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        user.setProfileCompleted(true); // optional

        repo.save(user);
        tokenRepo.delete(resetToken);

        return "Password reset successful";
    }

    public Users getUser(String email) {
        return repo.findByEmail(email);
    }

    public Optional<Users> getById(UUID farmerId) {
        return repo.findById(farmerId);
    }

//    public void resetPasswordWithToken(String token, String newPassword) {
//        // Find user by reset token
//        Users user = repo.findByResetToken(token)
//                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
//
//        // Check if token is expired
//        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
//            throw new IllegalArgumentException("Reset token has expired");
//        }
//
//        // Set new password (hash it!)
//        String encodedPassword = encoder.encode(newPassword);
//        user.setPassword(encodedPassword);
//
//        // Invalidate token
//        user.setResetToken(null);
//        user.setTokenExpiry(null);
//
//        // Save changes
//        userRepository.save(user);
//    }

}
