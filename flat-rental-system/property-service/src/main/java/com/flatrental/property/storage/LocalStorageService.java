package com.flatrental.property.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.UUID;

@Service
@Primary
public class LocalStorageService implements MediaStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    @Override
    public String storeImage(byte[] data, String originalFilename, String contentType) {
        if (data == null || data.length == 0) {
            return null;
        }
        String mime = (contentType != null && !contentType.isBlank()) ? contentType : "image/jpeg";
        String base64 = Base64.getEncoder().encodeToString(data);
        log.info("Stored image locally ({}, {} bytes) as Data URI", originalFilename, data.length);
        return "data:" + mime + ";base64," + base64;
    }

    @Override
    public void deleteImage(String fileKey) {
        log.info("Local storage deleted reference: {}", fileKey);
    }

    @Override
    public String getServingUrl(String fileKey) {
        return fileKey;
    }

    @Override
    public String getProviderName() {
        return "LOCAL_STORAGE_FALLBACK";
    }
}
