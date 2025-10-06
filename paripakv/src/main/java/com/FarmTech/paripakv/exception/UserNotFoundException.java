package com.FarmTech.paripakv.exception;

import java.util.UUID;

public class UserNotFoundException extends Exception{
    public UserNotFoundException(UUID userId) {
        super("User not found: " + userId);
    }
}
