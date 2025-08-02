package com.FarmTech.paripakv.service;

import com.FarmTech.paripakv.dto.CompleteProfileRequest;
import com.FarmTech.paripakv.model.AuthProvider;
import com.FarmTech.paripakv.model.PasswordResetToken;
import com.FarmTech.paripakv.model.UserRole;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.PasswordResetTokenRepository;
import com.FarmTech.paripakv.repository.UserRepository;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToOne;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repo.findByEmail(email);
    }

    public Users register(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
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

    public void completeProfile(CompleteProfileRequest updatedUser, String email) {
        Users user = repo.findByEmail(email);

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
    public void initiatePasswordReset(String email) {
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

        String resetLink = "http://localhost:8089/users/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Reset Password", "Click here to reset your password: " + resetLink);
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
