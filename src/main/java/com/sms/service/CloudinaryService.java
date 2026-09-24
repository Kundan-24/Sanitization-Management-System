package com.sms.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        if (!isAllowedImage(file)) {
            throw new IllegalArgumentException("Supported image types: JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, AVIF and TIFF.");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "sanitization-services", "resource_type", "image"));
            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed.", e);
        }
    }

    private boolean isAllowedImage(MultipartFile file) {

        String contentType = file.getContentType();
        return contentType != null && (contentType.equals("image/jpeg") ||
                                contentType.equals("image/png") ||
                                contentType.equals("image/webp") ||
                                contentType.equals("image/gif") ||
                                contentType.equals("image/bmp") ||
                                contentType.equals("image/svg+xml") ||
                                contentType.equals("image/avif") ||
                                contentType.equals("image/tiff")
                );
    }
}