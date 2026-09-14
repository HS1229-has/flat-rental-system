package com.flatrental.property.dto;

import java.math.BigDecimal;

public class RentEstimationResponse {

    private BigDecimal estimatedRent;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private Integer confidenceScore; // Percentage 0 - 100
    private String marketDemand; // "High Demand", "Moderate Demand", "Stable"
    private BigDecimal baseRent;
    private BigDecimal furnishingPremium;
    private BigDecimal amenityBonus;
    private BigDecimal ratePerSqFt;
    private String summary;

    public RentEstimationResponse() {}

    public RentEstimationResponse(BigDecimal estimatedRent, BigDecimal minRent, BigDecimal maxRent,
                                  Integer confidenceScore, String marketDemand, BigDecimal baseRent,
                                  BigDecimal furnishingPremium, BigDecimal amenityBonus,
                                  BigDecimal ratePerSqFt, String summary) {
        this.estimatedRent = estimatedRent;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.confidenceScore = confidenceScore;
        this.marketDemand = marketDemand;
        this.baseRent = baseRent;
        this.furnishingPremium = furnishingPremium;
        this.amenityBonus = amenityBonus;
        this.ratePerSqFt = ratePerSqFt;
        this.summary = summary;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private BigDecimal estimatedRent;
        private BigDecimal minRent;
        private BigDecimal maxRent;
        private Integer confidenceScore;
        private String marketDemand;
        private BigDecimal baseRent;
        private BigDecimal furnishingPremium;
        private BigDecimal amenityBonus;
        private BigDecimal ratePerSqFt;
        private String summary;

        public Builder estimatedRent(BigDecimal val) { this.estimatedRent = val; return this; }
        public Builder minRent(BigDecimal val) { this.minRent = val; return this; }
        public Builder maxRent(BigDecimal val) { this.maxRent = val; return this; }
        public Builder confidenceScore(Integer val) { this.confidenceScore = val; return this; }
        public Builder marketDemand(String val) { this.marketDemand = val; return this; }
        public Builder baseRent(BigDecimal val) { this.baseRent = val; return this; }
        public Builder furnishingPremium(BigDecimal val) { this.furnishingPremium = val; return this; }
        public Builder amenityBonus(BigDecimal val) { this.amenityBonus = val; return this; }
        public Builder ratePerSqFt(BigDecimal val) { this.ratePerSqFt = val; return this; }
        public Builder summary(String val) { this.summary = val; return this; }

        public RentEstimationResponse build() {
            return new RentEstimationResponse(estimatedRent, minRent, maxRent, confidenceScore,
                    marketDemand, baseRent, furnishingPremium, amenityBonus, ratePerSqFt, summary);
        }
    }

    public BigDecimal getEstimatedRent() { return estimatedRent; }
    public void setEstimatedRent(BigDecimal estimatedRent) { this.estimatedRent = estimatedRent; }

    public BigDecimal getMinRent() { return minRent; }
    public void setMinRent(BigDecimal minRent) { this.minRent = minRent; }

    public BigDecimal getMaxRent() { return maxRent; }
    public void setMaxRent(BigDecimal maxRent) { this.maxRent = maxRent; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getMarketDemand() { return marketDemand; }
    public void setMarketDemand(String marketDemand) { this.marketDemand = marketDemand; }

    public BigDecimal getBaseRent() { return baseRent; }
    public void setBaseRent(BigDecimal baseRent) { this.baseRent = baseRent; }

    public BigDecimal getFurnishingPremium() { return furnishingPremium; }
    public void setFurnishingPremium(BigDecimal furnishingPremium) { this.furnishingPremium = furnishingPremium; }

    public BigDecimal getAmenityBonus() { return amenityBonus; }
    public void setAmenityBonus(BigDecimal amenityBonus) { this.amenityBonus = amenityBonus; }

    public BigDecimal getRatePerSqFt() { return ratePerSqFt; }
    public void setRatePerSqFt(BigDecimal ratePerSqFt) { this.ratePerSqFt = ratePerSqFt; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
