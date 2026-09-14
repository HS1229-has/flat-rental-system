package com.flatrental.property.storage;

public interface MediaStorageService {

    /**
     * Upload an image binary and return its permanent access URL or identifier.
     */
    String storeImage(byte[] data, String originalFilename, String contentType);

    /**
     * Delete an image from storage by its key or identifier.
     */
    void deleteImage(String fileKey);

    /**
     * Get the public or presigned serving URL for the image key.
     */
    String getServingUrl(String fileKey);

    /**
     * Return storage provider name (e.g. "AWS_S3" or "LOCAL_STORAGE").
     */
    String getProviderName();
}
