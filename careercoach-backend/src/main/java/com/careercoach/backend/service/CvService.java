package com.careercoach.backend.service;

import com.careercoach.backend.entity.CvDocument;
import com.careercoach.backend.entity.User;
import com.careercoach.backend.repository.CvDocumentRepository;
import com.careercoach.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CvService {

    private final CvDocumentRepository cvDocumentRepository;
    private final UserRepository userRepository;
    
    private final Path root = Paths.get("uploads");

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for CV uploads!", e);
        }
    }

    @Transactional
    public CvDocument uploadAndExtract(String username, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        // Validate content type / extension is PDF
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if ((contentType == null || !contentType.equalsIgnoreCase("application/pdf")) 
                && (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf"))) {
            throw new IllegalArgumentException("Only PDF format files are accepted");
        }

        // Validate size (max 5MB)
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds the 5MB limit");
        }

        // Save file locally with a unique name
        String extension = ".pdf";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path destination = this.root.resolve(uniqueFileName);
        
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        // Extract Text using Apache PDFBox
        String extractedText;
        try (PDDocument document = Loader.loadPDF(destination.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
        } catch (IOException e) {
            // Cleanup saved file on parsing failure
            Files.deleteIfExists(destination);
            throw new IOException("Failed to extract text from PDF: " + e.getMessage(), e);
        }

        // Fetch User and save CvDocument
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        CvDocument cvDocument = CvDocument.builder()
                .user(user)
                .fileName(originalFilename != null ? originalFilename : "CV.pdf")
                .fileSize(file.getSize())
                .filePath(destination.toAbsolutePath().toString())
                .extractedText(extractedText)
                .build();

        return cvDocumentRepository.save(cvDocument);
    }
}
