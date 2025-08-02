package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.PasswordResetToken;
import com.FarmTech.paripakv.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(Users user);

}
