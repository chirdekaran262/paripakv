package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.dto.AuthRequest;
import com.FarmTech.paripakv.dto.CompleteProfileRequest;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.security.JwtUtil;
import com.FarmTech.paripakv.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.http.HttpStatus;
=======
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
>>>>>>> new-feature
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
<<<<<<< HEAD
=======
import org.springframework.web.multipart.MultipartFile;
>>>>>>> new-feature

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

<<<<<<< HEAD
    @PostMapping("/register")
    public ResponseEntity<Users> register(@RequestBody Users users) {
        Users registered = userService.register(users);
        users.setProfileCompleted(true);
        return new ResponseEntity<>(registered, HttpStatus.CREATED); // 201 Created
    }

=======
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;


    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Users> register(
            @RequestPart("users") Users users,
            @RequestPart("profileImage") MultipartFile profileImage) throws IOException {

        Users registered = userService.register(users, profileImage);
        users.setProfileCompleted(true);
        return new ResponseEntity<>(registered, HttpStatus.CREATED);
    }


>>>>>>> new-feature
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        var user = userService.loadUserByUsername(request.getEmail());

        if (!userService.passwordMatch(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials"); // 401 Unauthorized
        }

        String token = jwtUtil.generateToken(user.getUsername());
        System.out.println(token);
        return ResponseEntity.ok(token); // 200 OK
    }

    @GetMapping("/oauth2/success")
    public void oauth2Success(@AuthenticationPrincipal OAuth2User oAuth2User,
                              HttpServletResponse response) throws IOException {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Users user = userService.findOrRegisterOAuthUser(email, name);
        String token = jwtUtil.generateToken(user.getEmail());
        if(!user.isProfileCompleted()) {
<<<<<<< HEAD
            response.sendRedirect("https://paripakv-f.onrender.com/complete-profile?token=" + token);
        }
        // Redirect to frontend with token in URL
        else {
            String redirectUrl = "https://paripakv-f.onrender.com/oauth2/redirect?token=" + token;
            response.sendRedirect(redirectUrl);
=======
            response.sendRedirect(frontendBaseUrl + "/complete-profile?token=" + token);
        }
        // Redirect to frontend with token in URL
        else {
            response.sendRedirect(frontendBaseUrl + "/reset-password?token=" + token);

>>>>>>> new-feature
        }
    }

    @PutMapping("/complete-profile")
<<<<<<< HEAD
    public ResponseEntity<String> completeProfile(@RequestBody CompleteProfileRequest updatedUser) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(email+updatedUser);
        userService.completeProfile(updatedUser, email);
        return ResponseEntity.ok("Profile completed successfully."); // 200 OK
    }

=======
    public ResponseEntity<String> completeProfile(
            @RequestPart("users") CompleteProfileRequest updatedUser,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) throws IOException {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(email + updatedUser);
        userService.completeProfile(updatedUser, email, profileImage);

        return ResponseEntity.ok("Profile completed successfully.");
    }


>>>>>>> new-feature
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        try {
            userService.initiatePasswordReset(email);
            return ResponseEntity.ok("Password reset link sent to: " + email);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }


    @GetMapping("/reset-password")
    public void handleResetPasswordRedirect(@RequestParam String token, HttpServletResponse response) throws IOException {
        // Optional: Validate token here if needed
<<<<<<< HEAD
        response.sendRedirect("https://paripakv-f.onrender.com/reset-password?token=" + token);
=======
        response.sendRedirect(frontendBaseUrl+"/reset-password?token=" + token);
>>>>>>> new-feature
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Password successfully reset.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
        }
    }


//    @PostMapping("/reset-password")
//    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
//        String msg = userService.resetPassword(token, newPassword);
//        return ResponseEntity.ok(msg);
//    }

    @GetMapping("/profile")
    public ResponseEntity<Users> getUsers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();




        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Users user = userService.getUser(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/productDetails")
    public ResponseEntity<Users> getUserDetails(@RequestParam UUID id) {
        Users user=userService.getById(id).orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println(user);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateAddress(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String newAddress = body.get("address");
        Optional<Users> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Users user = optionalUser.get();
        user.setAddress(newAddress);
        userRepo.save(user);

        return ResponseEntity.ok("Address updated successfully");
    }


}
