package com.FarmTech.paripakv.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class EmailService {

    public void sendEmail(String to, String subject, String htmlContent, File attachmentFile) throws IOException {
        Email from = new Email("krishivision.tech@gmail.com");
        Email recipient = new Email(to);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, recipient, content);

        // ✅ Optional Attachment Handling
        if (attachmentFile != null && attachmentFile.exists() && attachmentFile.isFile()) {
            try (FileInputStream fis = new FileInputStream(attachmentFile)) {
                byte[] fileData = fis.readAllBytes();
                String encodedFile = Base64.getEncoder().encodeToString(fileData);

                Attachments attachments = new Attachments();
                attachments.setContent(encodedFile);
                attachments.setType("application/pdf");
                attachments.setFilename("Invoice.pdf");
                attachments.setDisposition("attachment");

                mail.addAttachments(attachments);
                System.out.println("✅ Invoice attached successfully: " + attachmentFile.getName());
            } catch (IOException e) {
                System.err.println("⚠️ Failed to attach invoice: " + e.getMessage());
            }
        } else {
            System.out.println("ℹ️ No invoice attachment found, sending email without attachment.");
        }

        // ✅ Send email via SendGrid
        SendGrid sg = new SendGrid(System.getenv("SENDGRID_API_KEY"));
        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sg.api(request);
        System.out.println("📤 SendGrid Response Code: " + response.getStatusCode());
        System.out.println("📝 SendGrid Body: " + response.getBody());
    }
}
