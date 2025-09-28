package com.FarmTech.paripakv.controller;

import com.FarmTech.paripakv.dto.AuthRequest;
import com.FarmTech.paripakv.dto.CompleteProfileRequest;
import com.FarmTech.paripakv.exception.InvalidDataException;
import com.FarmTech.paripakv.exception.UserAlreadyExistsException;
import com.FarmTech.paripakv.model.Users;
import com.FarmTech.paripakv.repository.UserRepository;
import com.FarmTech.paripakv.security.JwtUtil;
import com.FarmTech.paripakv.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
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


    @Value("${frontend.base-url}")
    private String frontendBaseUrl;


    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> register(
            @RequestPart("users") Users users,
            @RequestPart("profileImage") MultipartFile profileImage) throws IOException, MessagingException {

        Map<String, Object> response = new HashMap<>();

        try {
            Users registered = userService.register(users, profileImage);
            registered.setProfileCompleted(true);

            response.put("status", "success");
            response.put("message", "Registration successful!");
            response.put("data", registered);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (UserAlreadyExistsException ex) {
            response.put("status", "error");
            response.put("message", "User already exists. Please login.");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);

        } catch (InvalidDataException ex) {
            response.put("status", "error");
            response.put("message", "Invalid data. Please check your inputs.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        } catch (Exception ex) {
            response.put("status", "error");
            response.put("message", "Server error. Please try again later.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



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

            response.sendRedirect(frontendBaseUrl + "/complete-profile?token=" + token);
        }
        // Redirect to frontend with token in URL
        else {
            response.sendRedirect(frontendBaseUrl + "/reset-password?token=" + token);

        }
    }

    @PutMapping("/complete-profile")
    public ResponseEntity<String> completeProfile(
            @RequestPart("users") CompleteProfileRequest updatedUser,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) throws IOException {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(email + updatedUser);
        userService.completeProfile(updatedUser, email, profileImage);

        return ResponseEntity.ok("Profile completed successfully.");
    }


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
        response.sendRedirect(frontendBaseUrl+"/reset-password?token=" + token);
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
