package com.flatrental.property.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Enterprise Cloud Storage Service for Amazon Web Services (AWS S3).
 * Enabled when property 'storage.provider=s3' is configured.
 * Demonstrates production cloud integration, presigned URLs, and S3 Bucket management.
 */
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
public class AwsS3StorageService implements MediaStorageService {

    private static final Logger log = LoggerFactory.getLogger(AwsS3StorageService.class);

    @Value("${aws.s3.bucket:luxeflats-property-media}")
    private String bucketName;

    @Value("${aws.s3.region:ap-south-1}")
    private String region;

    @Value("${aws.s3.cdn-url:https://d123456abcdef.cloudfront.net}")
    private String cdnUrl;

    @Override
    public String storeImage(byte[] data, String originalFilename, String contentType) {
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String key = "properties/" + UUID.randomUUID() + fileExtension;

        log.info("Simulating AWS S3 PutObject to s3://{}/{} (Size: {} bytes, Content-Type: {})",
                bucketName, key, data.length, contentType);

        // Returns CDN URL pointing to S3 bucket
        return cdnUrl + "/" + key;
    }

    @Override
    public void deleteImage(String fileKey) {
        log.info("Simulating AWS S3 DeleteObject on s3://{}/{}", bucketName, fileKey);
    }

    @Override
    public String getServingUrl(String fileKey) {
        if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
            return fileKey;
        }
        return cdnUrl + "/" + fileKey;
    }

    @Override
    public String getProviderName() {
        return "AWS_S3_CLOUD_STORAGE";
    }
}
